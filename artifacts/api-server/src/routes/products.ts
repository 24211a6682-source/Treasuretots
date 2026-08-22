import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { ListProductsQueryParams, SearchProductsQueryParams, GetProductParams } from "@workspace/api-zod";

const router = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    price: p.price ? Number(p.price) : null,
    stock: p.stock,
    coverImage: p.coverImage,
    images: Array.isArray(p.images) ? p.images : [],
    category: p.category,
    subcategory: p.subcategory ?? null,
    slug: p.slug,
    isBuyable: p.isBuyable,
    isActive: p.isActive,
  };
}

router.get("/v1/products", async (req, res) => {
  try {
    const params = ListProductsQueryParams.safeParse(req.query);
    const { category, subcategory, page = 1, per_page = 20 } = params.success ? params.data : { category: undefined, subcategory: undefined, page: 1, per_page: 20 };

    const conditions: SQL[] = [eq(productsTable.isActive, true)];
    if (category) conditions.push(eq(productsTable.category, category));
    if (subcategory) conditions.push(eq(productsTable.subcategory, subcategory));

    const allProducts = await db.select().from(productsTable).where(and(...conditions));
    const total = allProducts.length;
    const offset = (page - 1) * per_page;
    const products = allProducts.slice(offset, offset + per_page).map(formatProduct);

    res.json({ products, total, page, perPage: per_page });
  } catch (err) {
    req.log.error({ err }, "List products error");
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.get("/v1/products/search", async (req, res) => {
  try {
    const params = SearchProductsQueryParams.safeParse(req.query);
    if (!params.success) {
      res.status(400).json({ error: "Query parameter q is required" });
      return;
    }
    const q = params.data.q.trim().replace(/\s+/g, " ");
    if (!q) {
      res.status(400).json({ error: "Query parameter q is required" });
      return;
    }
    const products = await db.select().from(productsTable).where(
      and(
        eq(productsTable.isActive, true),
        ilike(productsTable.name, `%${q}%`)
      )
    );
    res.json(products.map(formatProduct));
  } catch (err) {
    req.log.error({ err }, "Search products error");
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/v1/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [product] = await db.select().from(productsTable).where(
      and(eq(productsTable.slug, slug), eq(productsTable.isActive, true))
    ).limit(1);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(formatProduct(product));
  } catch (err) {
    req.log.error({ err }, "Get product error");
    res.status(500).json({ error: "Failed to get product" });
  }
});

export default router;
