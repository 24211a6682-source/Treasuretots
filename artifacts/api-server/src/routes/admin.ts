import { Router } from "express";
import multer from "multer";
import { db, productsTable, ordersTable, orderItemsTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAuth";
import { AdminCreateProductBody, AdminUpdateProductBody, AdminUpdateOrderStatusBody, AdminListOrdersQueryParams } from "@workspace/api-zod";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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

// Image upload → Cloudinary (unsigned preset, no API key needed)
router.post("/v1/admin/products/upload", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }
  try {
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      res.status(500).json({ error: "Cloudinary not configured" });
      return;
    }
    const fd = new FormData();
    fd.append("file", new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }), req.file.originalname);
    fd.append("upload_preset", preset);
    fd.append("folder", "treasuretots/products");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: fd,
    });
    const result = await response.json() as { secure_url?: string; error?: { message: string } };
    if (!result.secure_url) {
      req.log.error({ result }, "Cloudinary upload failed");
      res.status(500).json({ error: result.error?.message ?? "Upload failed" });
      return;
    }
    res.json({ url: result.secure_url });
  } catch (err) {
    req.log.error({ err }, "Upload route error");
    res.status(500).json({ error: "Upload failed" });
  }
});

// Products
router.get("/v1/admin/products", requireAdmin, async (req, res) => {
  try {
    const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
    res.json(products.map(formatProduct));
  } catch (err) {
    req.log.error({ err }, "Admin list products error");
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.post("/v1/admin/products", requireAdmin, async (req, res) => {
  const parse = AdminCreateProductBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const data = parse.data;
    const imagesList = data.images && data.images.length > 0
      ? data.images
      : data.coverImage ? [data.coverImage] : [];
    const [product] = await db.insert(productsTable).values({
      name: data.name,
      description: data.description ?? null,
      price: data.price != null ? String(data.price) : null,
      stock: data.stock ?? 999,
      coverImage: data.coverImage,
      images: imagesList,
      category: data.category,
      subcategory: data.subcategory ?? null,
      slug: data.slug,
      isBuyable: data.isBuyable ?? true,
      isActive: true,
    }).returning();
    res.status(201).json(formatProduct(product));
  } catch (err) {
    req.log.error({ err }, "Admin create product error");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/v1/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const parse = AdminUpdateProductBody.safeParse(req.body);
  if (!parse.success || isNaN(id)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const data = parse.data;
    const updateData: Partial<typeof productsTable.$inferInsert> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price != null ? String(data.price) : null;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.images !== undefined) {
      updateData.images = data.images.length > 0 ? data.images : (data.coverImage ? [data.coverImage] : data.images);
    } else if (data.coverImage !== undefined) {
      const [existing] = await db.select({ images: productsTable.images }).from(productsTable).where(eq(productsTable.id, id)).limit(1);
      const existingImages = Array.isArray(existing?.images) ? existing.images as string[] : [];
      if (existingImages.length === 0) updateData.images = [data.coverImage];
    }
    if (data.category !== undefined) updateData.category = data.category;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
    if (data.isBuyable !== undefined) updateData.isBuyable = data.isBuyable;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(formatProduct(product));
  } catch (err) {
    req.log.error({ err }, "Admin update product error");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/v1/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  try {
    await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete product error");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Orders
router.get("/v1/admin/orders", requireAdmin, async (req, res) => {
  try {
    const params = AdminListOrdersQueryParams.safeParse(req.query);
    const { payment_status, order_status } = params.success ? params.data : {};
    
    let orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    if (payment_status) orders = orders.filter(o => o.paymentStatus === payment_status);
    if (order_status) orders = orders.filter(o => o.orderStatus === order_status);

    const formatted = await Promise.all(orders.map(async order => {
      const items = await db.select({
        id: orderItemsTable.id,
        productId: orderItemsTable.productId,
        quantity: orderItemsTable.quantity,
        price: orderItemsTable.price,
        product: { id: productsTable.id, name: productsTable.name, coverImage: productsTable.coverImage, images: productsTable.images, category: productsTable.category, subcategory: productsTable.subcategory, slug: productsTable.slug, isBuyable: productsTable.isBuyable, isActive: productsTable.isActive, description: productsTable.description, stock: productsTable.stock, price: productsTable.price },
      }).from(orderItemsTable).leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id)).where(eq(orderItemsTable.orderId, order.id));
      
      const user = await db.select({ name: usersTable.name, email: usersTable.email, phone: usersTable.phone }).from(usersTable).where(eq(usersTable.id, order.userId!)).limit(1);

      return {
        id: order.id, totalAmount: Number(order.totalAmount),
        shippingAmount: Number(order.shippingAmount),
        paymentStatus: order.paymentStatus, orderStatus: order.orderStatus,
        childName: order.childName ?? null, shippingAddress: order.shippingAddress,
        razorpayOrderId: order.razorpayOrderId ?? null,
        razorpayPaymentId: order.razorpayPaymentId ?? null,
        paymentMethod: order.paymentMethod ?? null,
        paidAt: order.paidAt ? order.paidAt.toISOString() : null,
        createdAt: order.createdAt,
        user: user[0] ?? null,
        items: items.map(item => ({
          id: item.id, productId: item.productId!, quantity: item.quantity, price: Number(item.price),
          product: item.product ? { ...item.product, price: item.product.price ? Number(item.product.price) : null, images: Array.isArray(item.product.images) ? item.product.images : [] } : undefined,
        })),
      };
    }));
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Admin list orders error");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.patch("/v1/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const parse = AdminUpdateOrderStatusBody.safeParse(req.body);
  if (!parse.success || isNaN(id)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const updateData: Partial<typeof ordersTable.$inferInsert> = {};
    if (parse.data.orderStatus) updateData.orderStatus = parse.data.orderStatus;
    if (parse.data.paymentStatus) updateData.paymentStatus = parse.data.paymentStatus;
    const [order] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, id)).returning();
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const items = await db.select({ id: orderItemsTable.id, productId: orderItemsTable.productId, quantity: orderItemsTable.quantity, price: orderItemsTable.price, product: { id: productsTable.id, name: productsTable.name, coverImage: productsTable.coverImage, images: productsTable.images, category: productsTable.category, subcategory: productsTable.subcategory, slug: productsTable.slug, isBuyable: productsTable.isBuyable, isActive: productsTable.isActive, description: productsTable.description, stock: productsTable.stock, price: productsTable.price } }).from(orderItemsTable).leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id)).where(eq(orderItemsTable.orderId, order.id));
    res.json({
      id: order.id, totalAmount: Number(order.totalAmount),
      shippingAmount: Number(order.shippingAmount),
      paymentStatus: order.paymentStatus, orderStatus: order.orderStatus,
      childName: order.childName ?? null, shippingAddress: order.shippingAddress,
      razorpayOrderId: order.razorpayOrderId ?? null,
      razorpayPaymentId: order.razorpayPaymentId ?? null,
      paymentMethod: order.paymentMethod ?? null,
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      createdAt: order.createdAt,
      items: items.map(item => ({ id: item.id, productId: item.productId!, quantity: item.quantity, price: Number(item.price), product: item.product ? { ...item.product, price: item.product.price ? Number(item.product.price) : null, images: Array.isArray(item.product.images) ? item.product.images : [] } : undefined })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin update order status error");
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Users
router.get("/v1/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone, role: usersTable.role, createdAt: usersTable.createdAt }).from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Admin list users error");
    res.status(500).json({ error: "Failed to list users" });
  }
});

// Users — update role
router.patch("/v1/admin/users/:id/role", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const { role } = req.body as { role?: string };
  if (isNaN(id) || !["admin", "user"].includes(role ?? "")) {
    res.status(400).json({ error: "Invalid user ID or role. Must be 'admin' or 'user'." });
    return;
  }
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role });
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Admin update user role error");
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// Analytics
router.get("/v1/admin/analytics", requireAdmin, async (req, res) => {
  try {
    const [revenueResult] = await db.select({ total: sql<string>`COALESCE(SUM(total_amount), 0)` }).from(ordersTable).where(eq(ordersTable.paymentStatus, "paid"));
    const [orderCountResult] = await db.select({ count: sql<string>`COUNT(*)` }).from(ordersTable);
    const [userCountResult] = await db.select({ count: sql<string>`COUNT(*)` }).from(usersTable);
    
    const topItems = await db.select({ productId: orderItemsTable.productId, total: sql<string>`SUM(quantity)` })
      .from(orderItemsTable).groupBy(orderItemsTable.productId).orderBy(desc(sql`SUM(quantity)`)).limit(1);
    
    let topProductName: string | null = null;
    if (topItems[0]?.productId) {
      const [p] = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, topItems[0].productId)).limit(1);
      topProductName = p?.name ?? null;
    }

    // Monthly revenue (last 6 months)
    const monthlyData = await db.select({
      month: sql<string>`TO_CHAR(created_at, 'Mon YYYY')`,
      revenue: sql<string>`SUM(total_amount)`,
    }).from(ordersTable)
      .where(and(eq(ordersTable.paymentStatus, "paid"), sql`created_at >= NOW() - INTERVAL '6 months'`))
      .groupBy(sql`TO_CHAR(created_at, 'Mon YYYY')`)
      .orderBy(sql`TO_CHAR(created_at, 'Mon YYYY')`);

    res.json({
      totalRevenue: Number(revenueResult?.total ?? 0),
      totalOrders: Number(orderCountResult?.count ?? 0),
      activeUsers: Number(userCountResult?.count ?? 0),
      topProduct: topProductName,
      monthlyRevenue: monthlyData.map(m => ({ month: m.month, revenue: Number(m.revenue) })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin analytics error");
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

export default router;
