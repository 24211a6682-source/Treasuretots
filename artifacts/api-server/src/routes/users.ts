import { Router } from "express";
import { db, usersTable, addressesTable, wishlistItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { UpdateProfileBody, CreateAddressBody, AddToWishlistBody } from "@workspace/api-zod";

const router = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, description: p.description ?? null,
    price: p.price ? Number(p.price) : null, stock: p.stock,
    coverImage: p.coverImage, images: Array.isArray(p.images) ? p.images : [],
    category: p.category, subcategory: p.subcategory ?? null, slug: p.slug,
    isBuyable: p.isBuyable, isActive: p.isActive,
  };
}

router.patch("/v1/users/profile", requireAuth, async (req, res) => {
  const parse = UpdateProfileBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [user] = await db.update(usersTable)
      .set({ ...parse.data })
      .where(eq(usersTable.id, req.user!.userId))
      .returning();
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    req.log.error({ err }, "Update profile error");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/v1/users/addresses", requireAuth, async (req, res) => {
  try {
    const addresses = await db.select().from(addressesTable).where(eq(addressesTable.userId, req.user!.userId));
    res.json(addresses);
  } catch (err) {
    req.log.error({ err }, "List addresses error");
    res.status(500).json({ error: "Failed to list addresses" });
  }
});

router.post("/v1/users/addresses", requireAuth, async (req, res) => {
  const parse = CreateAddressBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    if (parse.data.isDefault) {
      await db.update(addressesTable).set({ isDefault: false }).where(eq(addressesTable.userId, req.user!.userId));
    }
    const [address] = await db.insert(addressesTable).values({
      userId: req.user!.userId,
      ...parse.data,
    }).returning();
    res.status(201).json(address);
  } catch (err) {
    req.log.error({ err }, "Create address error");
    res.status(500).json({ error: "Failed to create address" });
  }
});

router.get("/v1/users/wishlist", requireAuth, async (req, res) => {
  try {
    const items = await db.select({ product: productsTable })
      .from(wishlistItemsTable)
      .leftJoin(productsTable, eq(wishlistItemsTable.productId, productsTable.id))
      .where(eq(wishlistItemsTable.userId, req.user!.userId));
    res.json(items.filter(i => i.product).map(i => formatProduct(i.product!)));
  } catch (err) {
    req.log.error({ err }, "Get wishlist error");
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

router.post("/v1/users/wishlist", requireAuth, async (req, res) => {
  const parse = AddToWishlistBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { productId } = parse.data;
  try {
    const existing = await db.select().from(wishlistItemsTable).where(
      and(eq(wishlistItemsTable.userId, req.user!.userId), eq(wishlistItemsTable.productId, productId))
    ).limit(1);
    if (existing.length === 0) {
      await db.insert(wishlistItemsTable).values({ userId: req.user!.userId, productId });
    }
    const items = await db.select({ product: productsTable })
      .from(wishlistItemsTable)
      .leftJoin(productsTable, eq(wishlistItemsTable.productId, productsTable.id))
      .where(eq(wishlistItemsTable.userId, req.user!.userId));
    res.json(items.filter(i => i.product).map(i => formatProduct(i.product!)));
  } catch (err) {
    req.log.error({ err }, "Add to wishlist error");
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

router.delete("/v1/users/wishlist/:productId", requireAuth, async (req, res) => {
  const productId = parseInt(String(req.params.productId));
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  try {
    await db.delete(wishlistItemsTable).where(
      and(eq(wishlistItemsTable.userId, req.user!.userId), eq(wishlistItemsTable.productId, productId))
    );
    const items = await db.select({ product: productsTable })
      .from(wishlistItemsTable)
      .leftJoin(productsTable, eq(wishlistItemsTable.productId, productsTable.id))
      .where(eq(wishlistItemsTable.userId, req.user!.userId));
    res.json(items.filter(i => i.product).map(i => formatProduct(i.product!)));
  } catch (err) {
    req.log.error({ err }, "Remove from wishlist error");
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

export default router;
