import { Router } from "express";
import { db, usersTable, addressesTable, wishlistItemsTable, productsTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import {
  UpdateProfileBody,
  CreateAddressBody,
  SetDefaultAddressParams,
  DeleteAddressParams,
  AddToWishlistBody,
} from "@workspace/api-zod";

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
    const address = await db.transaction(async (tx) => {
      const existingAddress = await tx.select({ id: addressesTable.id })
        .from(addressesTable)
        .where(eq(addressesTable.userId, req.user!.userId))
        .limit(1);
      const shouldBeDefault = Boolean(parse.data.isDefault) || existingAddress.length === 0;

      if (shouldBeDefault) {
        await tx.update(addressesTable)
          .set({ isDefault: false })
          .where(eq(addressesTable.userId, req.user!.userId));
      }

      const [createdAddress] = await tx.insert(addressesTable).values({
        userId: req.user!.userId,
        ...parse.data,
        isDefault: shouldBeDefault,
      }).returning();
      return createdAddress;
    });
    res.status(201).json(address);
  } catch (err) {
    req.log.error({ err }, "Create address error");
    res.status(500).json({ error: "Failed to create address" });
  }
});

router.patch("/v1/users/addresses/:id/default", requireAuth, async (req, res) => {
  const params = SetDefaultAddressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid address ID" });
    return;
  }
  try {
    const address = await db.transaction(async (tx) => {
      const [ownedAddress] = await tx.select({ id: addressesTable.id })
        .from(addressesTable)
        .where(and(
          eq(addressesTable.id, params.data.id),
          eq(addressesTable.userId, req.user!.userId),
        ))
        .limit(1);
      if (!ownedAddress) return null;

      await tx.update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.userId, req.user!.userId));
      const [updatedAddress] = await tx.update(addressesTable)
        .set({ isDefault: true })
        .where(and(
          eq(addressesTable.id, params.data.id),
          eq(addressesTable.userId, req.user!.userId),
        ))
        .returning();
      return updatedAddress;
    });
    if (!address) {
      res.status(404).json({ error: "Address not found" });
      return;
    }
    res.json(address);
  } catch (err) {
    req.log.error({ err }, "Set default address error");
    res.status(500).json({ error: "Failed to set default address" });
  }
});

router.delete("/v1/users/addresses/:id", requireAuth, async (req, res) => {
  const params = DeleteAddressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid address ID" });
    return;
  }
  try {
    const deletedAddress = await db.transaction(async (tx) => {
      const [ownedAddress] = await tx.select()
        .from(addressesTable)
        .where(and(
          eq(addressesTable.id, params.data.id),
          eq(addressesTable.userId, req.user!.userId),
        ))
        .limit(1);
      if (!ownedAddress) return null;

      await tx.delete(addressesTable).where(and(
        eq(addressesTable.id, params.data.id),
        eq(addressesTable.userId, req.user!.userId),
      ));

      if (ownedAddress.isDefault) {
        const [nextAddress] = await tx.select({ id: addressesTable.id })
          .from(addressesTable)
          .where(eq(addressesTable.userId, req.user!.userId))
          .orderBy(asc(addressesTable.createdAt), asc(addressesTable.id))
          .limit(1);
        if (nextAddress) {
          await tx.update(addressesTable)
            .set({ isDefault: true })
            .where(and(
              eq(addressesTable.id, nextAddress.id),
              eq(addressesTable.userId, req.user!.userId),
            ));
        }
      }

      return ownedAddress;
    });
    if (!deletedAddress) {
      res.status(404).json({ error: "Address not found" });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Delete address error");
    res.status(500).json({ error: "Failed to delete address" });
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
