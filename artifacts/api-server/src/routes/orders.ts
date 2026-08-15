import { Router } from "express";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { InitializeOrderBody, VerifyPaymentBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const SHIPPING_AMOUNT = 70; // flat rate, pan-India, authoritative server value

async function formatOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select({
    id: orderItemsTable.id,
    productId: orderItemsTable.productId,
    quantity: orderItemsTable.quantity,
    price: orderItemsTable.price,
    product: {
      id: productsTable.id,
      name: productsTable.name,
      coverImage: productsTable.coverImage,
      images: productsTable.images,
      category: productsTable.category,
      subcategory: productsTable.subcategory,
      slug: productsTable.slug,
      isBuyable: productsTable.isBuyable,
      isActive: productsTable.isActive,
      description: productsTable.description,
      stock: productsTable.stock,
      price: productsTable.price,
    },
  }).from(orderItemsTable)
    .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .where(eq(orderItemsTable.orderId, order.id));

  return {
    id: order.id,
    totalAmount: Number(order.totalAmount),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    childName: order.childName ?? null,
    shippingAddress: order.shippingAddress,
    razorpayOrderId: order.razorpayOrderId ?? null,
    createdAt: order.createdAt,
    items: items.map(item => ({
      id: item.id,
      productId: item.productId!,
      quantity: item.quantity,
      price: Number(item.price),
      product: item.product ? {
        ...item.product,
        price: item.product.price ? Number(item.product.price) : null,
        images: Array.isArray(item.product.images) ? item.product.images : [],
      } : undefined,
    })),
  };
}

router.get("/v1/orders", requireAuth, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.userId, req.user!.userId))
      .orderBy(ordersTable.createdAt);
    const formatted = await Promise.all(orders.map(formatOrder));
    res.json(formatted.reverse());
  } catch (err) {
    req.log.error({ err }, "List orders error");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.post("/v1/orders/initialize", requireAuth, async (req, res) => {
  const parse = InitializeOrderBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { items, childName, address } = parse.data;
  try {
    // Validate products and calculate total
    let totalAmount = 0;
    const orderItemData: { productId: number; quantity: number; price: number }[] = [];

    for (const item of items) {
      const [product] = await db.select().from(productsTable)
        .where(and(eq(productsTable.id, item.productId), eq(productsTable.isActive, true))).limit(1);
      if (!product) {
        res.status(404).json({ error: `Product ${item.productId} not found` });
        return;
      }
      const price = Number(product.price ?? 0);
      totalAmount += price * item.quantity;
      orderItemData.push({ productId: item.productId, quantity: item.quantity, price });
    }

    // Add flat shipping — server is the authoritative source; never trust client values
    const finalAmount = totalAmount + SHIPPING_AMOUNT;

    // Create Razorpay order if keys are configured.
    // When keys are present but the API call fails, we return 503 rather than
    // silently falling back to a fake ID — a fake ID would cause the frontend to
    // open a live Checkout modal against an order Razorpay has never seen.
    let razorpayOrderId: string | null = null;
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
          },
          body: JSON.stringify({
            amount: Math.round(finalAmount * 100),
            currency: "INR",
            receipt: `tt_${Date.now()}`,
            payment_capture: 1,
          }),
        });
        if (response.ok) {
          const rzpOrder = await response.json() as { id: string };
          razorpayOrderId = rzpOrder.id;
        } else {
          const errBody = await response.text();
          req.log.error({ status: response.status, body: errBody }, "Razorpay order creation HTTP error");
          res.status(503).json({ error: "Payment service unavailable — please try again" });
          return;
        }
      } catch (rzpErr) {
        req.log.error({ err: rzpErr }, "Razorpay order creation failed");
        res.status(503).json({ error: "Payment service unavailable — please try again" });
        return;
      }
    }

    // Create order in DB — store subtotal, shipping, and final total separately
    const [order] = await db.insert(ordersTable).values({
      userId: req.user!.userId,
      totalAmount: finalAmount.toFixed(2),
      shippingAmount: SHIPPING_AMOUNT.toFixed(2),
      paymentStatus: "pending",
      orderStatus: "order_received",
      childName: childName ?? null,
      shippingAddress: address,
      razorpayOrderId,
    }).returning();

    // Create order items
    for (const item of orderItemData) {
      await db.insert(orderItemsTable).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toFixed(2),
      });
    }

    res.status(201).json({
      orderId: order.id,
      razorpayOrderId,
      amount: finalAmount,
      key: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    req.log.error({ err }, "Initialize order error");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/v1/orders/verify", requireAuth, async (req, res) => {
  const parse = VerifyPaymentBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = parse.data;
  try {
    if (!RAZORPAY_KEY_SECRET) {
      res.status(503).json({ error: "Payment verification unavailable: server not configured for payments" });
      return;
    }
    const msg = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(msg).digest("hex");
    const paymentValid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpaySignature));

    if (!paymentValid) {
      res.status(400).json({ error: "Payment verification failed" });
      return;
    }

    // Idempotency guard: if this order is already paid (e.g. the webhook landed
    // first, or the user double-submitted), short-circuit and return current state.
    const [existingOrder] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, req.user!.userId)))
      .limit(1);

    if (!existingOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (existingOrder.paymentStatus === "paid") {
      res.json(await formatOrder(existingOrder));
      return;
    }

    const [order] = await db.update(ordersTable)
      .set({
        paymentStatus: "paid",
        orderStatus: "order_received",
        razorpayPaymentId,
        razorpaySignature,
      })
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, req.user!.userId)))
      .returning();

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Decrement stock for each product in the order
    const orderItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
    for (const item of orderItems) {
      const updated = await db.update(productsTable)
        .set({ stock: sql`stock - ${item.quantity}` })
        .where(and(eq(productsTable.id, item.productId!), gte(productsTable.stock, item.quantity)))
        .returning();
      if (updated.length === 0) {
        req.log.warn({ productId: item.productId, quantity: item.quantity }, "Insufficient stock for decrement — skipped");
      }
    }

    res.json(await formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Verify payment error");
    res.status(500).json({ error: "Payment verification failed" });
  }
});

router.get("/v1/orders/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }
  try {
    const [order] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, req.user!.userId))).limit(1);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(await formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Get order error");
    res.status(500).json({ error: "Failed to get order" });
  }
});

export default router;
