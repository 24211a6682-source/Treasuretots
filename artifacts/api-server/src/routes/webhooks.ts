import { Router } from "express";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq, and, gte, sql, inArray } from "drizzle-orm";
import crypto from "crypto";
import { sendOrderConfirmation } from "../lib/email";

const router = Router();

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

/**
 * POST /v1/webhooks/razorpay
 *
 * Reconciliation path for Razorpay payment events. Safe to run before or
 * after /v1/orders/verify — whichever lands first wins via the idempotency
 * guard; the second one is a no-op.
 *
 * Events handled: payment.captured, payment.failed, order.paid
 */
router.post("/v1/webhooks/razorpay", async (req, res) => {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    req.log.error("RAZORPAY_WEBHOOK_SECRET not configured — webhook processing disabled");
    res.status(503).json({ error: "Webhook processing unavailable" });
    return;
  }

  const signature = req.headers["x-razorpay-signature"];
  if (!signature || typeof signature !== "string") {
    res.status(400).json({ error: "Missing X-Razorpay-Signature header" });
    return;
  }

  const rawBody = (req as Express.Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    req.log.error("rawBody unavailable — express.json verify callback may not be configured");
    res.status(500).json({ error: "Internal configuration error" });
    return;
  }

  // Verify HMAC-SHA256 signature using constant-time compare
  const expectedHex = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");

  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    req.log.warn({ origin: req.ip }, "Razorpay webhook signature verification failed");
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const eventType: string = req.body?.event ?? "";
  const paymentEntity = req.body?.payload?.payment?.entity;

  try {
    if (
      eventType === "payment.captured" ||
      eventType === "order.paid"
    ) {
      const razorpayOrderId: string | undefined = paymentEntity?.order_id;
      const razorpayPaymentId: string | undefined = paymentEntity?.id;
      const paymentMethod: string | undefined = paymentEntity?.method;

      if (!razorpayOrderId || !razorpayPaymentId) {
        req.log.warn({ eventType }, "Webhook event missing payment identifiers — acknowledged without action");
        res.json({ ok: true });
        return;
      }

      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.razorpayOrderId, razorpayOrderId))
        .limit(1);

      if (!order) {
        // Unknown order — acknowledge so Razorpay doesn't keep retrying
        req.log.warn({ razorpayOrderId, eventType }, "Webhook: order not found in DB");
        res.json({ ok: true });
        return;
      }

      // Idempotency guard — whichever processor (verify or webhook) lands first wins
      if (order.paymentStatus === "paid") {
        req.log.info({ orderId: order.id, eventType }, "Webhook: order already paid — skipping");
        res.json({ ok: true });
        return;
      }

      // Atomic update: WHERE paymentStatus IN ('pending','failed') prevents
      // double-processing while still allowing the legitimate retry path:
      // Razorpay permits multiple payment attempts per order_id, so a
      // payment.captured event can validly arrive for an order currently marked
      // "failed" (first attempt declined, customer retried and succeeded).
      // The early "paid" guard above already blocks re-processing a paid order.
      const [updated] = await db
        .update(ordersTable)
        .set({
          paymentStatus: "paid",
          razorpayPaymentId,
          paymentMethod: paymentMethod ?? null,
          paidAt: new Date(),
        })
        .where(
          and(
            eq(ordersTable.id, order.id),
            inArray(ordersTable.paymentStatus, ["pending", "failed"]),
          ),
        )
        .returning();

      if (!updated) {
        // Another processor beat us to it — no-op
        req.log.info({ orderId: order.id, eventType }, "Webhook: order status changed before update — skipping");
        res.json({ ok: true });
        return;
      }

      // Decrement stock — only reached if this processor won the race
      const orderItems = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));

      for (const item of orderItems) {
        const decremented = await db
          .update(productsTable)
          .set({ stock: sql`stock - ${item.quantity}` })
          .where(
            and(
              eq(productsTable.id, item.productId!),
              gte(productsTable.stock, item.quantity),
            ),
          )
          .returning();
        if (decremented.length === 0) {
          req.log.warn(
            { productId: item.productId, quantity: item.quantity },
            "Webhook: insufficient stock for decrement — skipped",
          );
        }
      }

      req.log.info({ orderId: order.id, razorpayPaymentId, eventType }, "Webhook: order marked paid");

      // Send order confirmation email — fire-and-forget so the webhook response
      // is not delayed by the email provider. Errors are logged but do not fail the webhook.
      sendOrderConfirmation(order.id, req.log).catch((err) => {
        req.log.error({ err, orderId: order.id }, "sendOrderConfirmation threw unexpectedly");
      });

    } else if (eventType === "payment.failed") {
      const razorpayOrderId: string | undefined = paymentEntity?.order_id;

      if (razorpayOrderId) {
        // Only update if still pending — never overwrite a paid order
        await db
          .update(ordersTable)
          .set({ paymentStatus: "failed" })
          .where(
            and(
              eq(ordersTable.razorpayOrderId, razorpayOrderId),
              eq(ordersTable.paymentStatus, "pending"),
            ),
          );
        req.log.info({ razorpayOrderId }, "Webhook: order marked failed");
      }

    } else {
      // Unhandled event — acknowledge silently
      req.log.info({ eventType }, "Webhook: unhandled event type — acknowledged");
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err, eventType }, "Webhook processing error");
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
