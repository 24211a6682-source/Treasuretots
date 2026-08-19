import { Router } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";

const router = Router();
const CART_LOCK_NAMESPACE = 62144;

async function buildCartResponse(userId: number) {
  const items = await db.select({
    id: cartItemsTable.id,
    productId: cartItemsTable.productId,
    quantity: cartItemsTable.quantity,
    childName: cartItemsTable.childName,
    product: {
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      coverImage: productsTable.coverImage,
      images: productsTable.images,
      category: productsTable.category,
      subcategory: productsTable.subcategory,
      slug: productsTable.slug,
      isBuyable: productsTable.isBuyable,
      isActive: productsTable.isActive,
      description: productsTable.description,
      stock: productsTable.stock,
    }
  }).from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    childName: item.childName ?? null,
    product: {
      ...item.product!,
      price: item.product?.price ? Number(item.product.price) : null,
      images: Array.isArray(item.product?.images) ? item.product.images : [],
    },
  }));

  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return { items: cartItems, total, itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0) };
}

router.get("/v1/cart", requireAuth, async (req, res) => {
  try {
    const cart = await buildCartResponse(req.user!.userId);
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Get cart error");
    res.status(500).json({ error: "Failed to get cart" });
  }
});

router.post("/v1/cart/items", requireAuth, async (req, res) => {
  const parse = AddToCartBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { productId, quantity = 1, childName } = parse.data;
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${CART_LOCK_NAMESPACE}, ${req.user!.userId})`);
      const existing = await tx.select().from(cartItemsTable).where(
        and(eq(cartItemsTable.userId, req.user!.userId), eq(cartItemsTable.productId, productId))
      ).limit(1);

      if (existing.length > 0) {
        await tx.update(cartItemsTable)
          .set({ quantity: existing[0].quantity + quantity })
          .where(eq(cartItemsTable.id, existing[0].id));
      } else {
        await tx.insert(cartItemsTable).values({
          userId: req.user!.userId,
          productId,
          quantity,
          childName: childName ?? null,
        });
      }
    });
    const cart = await buildCartResponse(req.user!.userId);
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Add to cart error");
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.post("/v1/cart/buy-now", requireAuth, async (req, res) => {
  const parse = AddToCartBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { productId, quantity = 1, childName } = parse.data;
  try {
    const [product] = await db
      .select({
        id: productsTable.id,
        isActive: productsTable.isActive,
        isBuyable: productsTable.isBuyable,
      })
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product?.isActive || !product.isBuyable) {
      res.status(400).json({ error: "This product is not available for checkout" });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${CART_LOCK_NAMESPACE}, ${req.user!.userId})`);
      await tx.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.user!.userId));
      await tx.insert(cartItemsTable).values({
        userId: req.user!.userId,
        productId,
        quantity,
        childName: childName ?? null,
      });
    });

    const cart = await buildCartResponse(req.user!.userId);
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Buy now cart replacement error");
    res.status(500).json({ error: "Failed to prepare checkout" });
  }
});

router.patch("/v1/cart/items/:productId", requireAuth, async (req, res) => {
  const productId = parseInt(String(req.params.productId));
  const parse = UpdateCartItemBody.safeParse(req.body);
  if (!parse.success || isNaN(productId)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { quantity } = parse.data;
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${CART_LOCK_NAMESPACE}, ${req.user!.userId})`);
      if (quantity <= 0) {
        await tx.delete(cartItemsTable).where(
          and(eq(cartItemsTable.userId, req.user!.userId), eq(cartItemsTable.productId, productId))
        );
      } else {
        await tx.update(cartItemsTable)
          .set({ quantity })
          .where(and(eq(cartItemsTable.userId, req.user!.userId), eq(cartItemsTable.productId, productId)));
      }
    });
    const cart = await buildCartResponse(req.user!.userId);
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Update cart item error");
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

router.delete("/v1/cart/items/:productId", requireAuth, async (req, res) => {
  const productId = parseInt(String(req.params.productId));
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${CART_LOCK_NAMESPACE}, ${req.user!.userId})`);
      await tx.delete(cartItemsTable).where(
        and(eq(cartItemsTable.userId, req.user!.userId), eq(cartItemsTable.productId, productId))
      );
    });
    const cart = await buildCartResponse(req.user!.userId);
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Remove from cart error");
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

router.delete("/v1/cart/clear", requireAuth, async (req, res) => {
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${CART_LOCK_NAMESPACE}, ${req.user!.userId})`);
      await tx.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.user!.userId));
    });
    res.json({ items: [], total: 0, itemCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Clear cart error");
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
