import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetAnalytics,
  useAdminListProducts,
  useAdminListOrders,
  useAdminListUsers,
  useAdminUpdateOrderStatus,
  useAdminDeleteProduct,
  useAdminCreateProduct,
  useAdminUpdateProduct,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, ShoppingBag, Users, Star, Pencil, Trash2, Plus, Package, LogOut } from "lucide-react";
import { format } from "date-fns";

const ORDER_STATUSES = ["order_received", "making", "dispatched", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-700",
    delivered: "bg-green-100 text-green-800",
    dispatched: "bg-blue-100 text-blue-800",
    making: "bg-orange-100 text-orange-800",
    order_received: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Product Form ────────────────────────────────────────────────────────────

type ProductFormData = {
  name: string; price: string; stock: string;
  category: string; subcategory: string; slug: string;
  description: string; coverImage: string;
};
const emptyForm: ProductFormData = { name: "", price: "", stock: "999", category: "learning", subcategory: "", slug: "", description: "", coverImage: "" };

function ProductDialog({
  open, onClose, initial, onSave,
}: { open: boolean; onClose: () => void; initial?: ProductFormData & { id?: number }; onSave: (data: ProductFormData & { id?: number }) => void; }) {
  const [form, setForm] = useState<ProductFormData>(initial ?? emptyForm);
  const set = (k: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          {(["name", "slug", "coverImage", "description", "category", "subcategory", "price", "stock"] as (keyof ProductFormData)[]).map(k => (
            <div key={k} className={k === "description" || k === "coverImage" || k === "name" ? "col-span-2" : ""}>
              <Label className="capitalize mb-1 block">{k}</Label>
              <Input value={form[k]} onChange={set(k)} placeholder={k} className="h-10" />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ ...form, id: initial?.id })} className="bg-primary">
            {initial?.id ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

export default function Admin() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Product dialog state
  const [productDialog, setProductDialog] = useState<{ open: boolean; product?: any }>({ open: false });
  // Order status filter
  const [orderFilter, setOrderFilter] = useState<string>("all");

  if (!isAuthenticated && typeof window !== "undefined") {
    setLocation("/login?returnUrl=/admin");
    return null;
  }
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-2xl font-bold">Admin access required</h2>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: analytics, isLoading: loadingAnalytics } = useAdminGetAnalytics({ query: { queryKey: ["adminAnalytics"], enabled: user?.role === "admin" } });
  const { data: products, isLoading: loadingProducts } = useAdminListProducts({ query: { queryKey: ["adminProducts"], enabled: user?.role === "admin" } });
  const { data: orders, isLoading: loadingOrders } = useAdminListOrders({}, { query: { queryKey: ["adminOrders"], enabled: user?.role === "admin" } });
  const { data: users, isLoading: loadingUsers } = useAdminListUsers({ query: { queryKey: ["adminUsers"], enabled: user?.role === "admin" } });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateOrderStatus = useAdminUpdateOrderStatus({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminOrders"] }); toast({ title: "Order updated" }); },
      onError: () => toast({ title: "Failed to update order", variant: "destructive" }),
    }
  });
  const deleteProduct = useAdminDeleteProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminProducts"] }); toast({ title: "Product deleted" }); },
      onError: () => toast({ title: "Failed to delete product", variant: "destructive" }),
    }
  });
  const createProduct = useAdminCreateProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminProducts"] }); setProductDialog({ open: false }); toast({ title: "Product added" }); },
      onError: () => toast({ title: "Failed to add product", variant: "destructive" }),
    }
  });
  const updateProduct = useAdminUpdateProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminProducts"] }); setProductDialog({ open: false }); toast({ title: "Product updated" }); },
      onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
    }
  });

  const handleSaveProduct = (data: ProductFormData & { id?: number }) => {
    const payload = {
      name: data.name, slug: data.slug, category: data.category,
      subcategory: data.subcategory || undefined,
      description: data.description || undefined,
      coverImage: data.coverImage,
      images: data.coverImage ? [data.coverImage] : [],
      price: data.price ? Number(data.price) : undefined,
      stock: data.stock ? Number(data.stock) : 999,
      isBuyable: true,
    };
    if (data.id) {
      updateProduct.mutate({ id: data.id, data: payload });
    } else {
      createProduct.mutate({ data: payload });
    }
  };

  const filteredOrders = (orders ?? []).filter((o: any) => orderFilter === "all" || o.orderStatus === orderFilter || o.paymentStatus === orderFilter);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Admin Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">TreasureTots Creations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => { logout(); setLocation("/"); }} className="gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics">
          <TabsList className="mb-8 bg-white border shadow-sm rounded-xl p-1 h-auto flex gap-1">
            {["analytics", "products", "orders", "users"].map(t => (
              <TabsTrigger key={t} value={t} className="capitalize rounded-lg px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── ANALYTICS ── */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Revenue" value={`₹${analytics?.totalRevenue?.toLocaleString("en-IN") ?? 0}`} icon={IndianRupee} color="bg-orange-100 text-primary" />
              <StatCard title="Total Orders" value={analytics?.totalOrders ?? 0} icon={ShoppingBag} color="bg-blue-100 text-blue-600" />
              <StatCard title="Registered Users" value={analytics?.activeUsers ?? 0} icon={Users} color="bg-green-100 text-green-600" />
              <StatCard title="Top Product" value={analytics?.topProduct ?? "—"} icon={Star} color="bg-purple-100 text-purple-600" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Revenue (last 6 months)</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
                  ) : (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics?.monthlyRevenue ?? []} barCategoryGap="35%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                          <Tooltip formatter={(v: number) => [`₹${v}`, "Revenue"]} cursor={{ fill: "#fff7ed" }} />
                          <Bar dataKey="revenue" fill="#FF7A00" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {(orders ?? []).slice(0, 8).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between px-6 py-3">
                        <div>
                          <p className="text-sm font-semibold">#{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.name ?? "Guest"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">₹{order.totalAmount}</p>
                          <StatusBadge status={order.paymentStatus} />
                        </div>
                      </div>
                    ))}
                    {!loadingOrders && !orders?.length && (
                      <p className="text-center py-8 text-muted-foreground text-sm">No orders yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── PRODUCTS ── */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Products</h2>
                <p className="text-sm text-muted-foreground">{products?.length ?? 0} products</p>
              </div>
              <Button onClick={() => setProductDialog({ open: true })} className="gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </div>

            <Card className="shadow-sm border-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingProducts && (
                      <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Loading products...</td></tr>
                    )}
                    {(products ?? []).map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <img src={p.coverImage || p.images?.[0]} alt={p.name} className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.slug}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="capitalize text-xs">{p.category}</Badge>
                          {p.subcategory && <p className="text-xs text-muted-foreground mt-1">{p.subcategory}</p>}
                        </td>
                        <td className="px-4 py-3 font-bold text-primary">
                          {p.price != null ? `₹${p.price}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.stock ?? "—"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.isActive ? "paid" : "cancelled"} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => setProductDialog({ open: true, product: p })}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate({ id: p.id }); }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loadingProducts && !products?.length && (
                      <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No products found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ── ORDERS ── */}
          <TabsContent value="orders">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold">Orders</h2>
                <p className="text-sm text-muted-foreground">{orders?.length ?? 0} total orders</p>
              </div>
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-48 h-9 rounded-lg border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                  {PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Card className="shadow-sm border-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      {["Order #", "Customer", "Items", "Total", "Payment", "Order Status", "Date", "Update"].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingOrders && (
                      <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">Loading orders...</td></tr>
                    )}
                    {filteredOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-gray-700">#{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{order.user?.name ?? "Guest"}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.phone ?? order.user?.email ?? ""}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 font-bold text-primary">₹{order.totalAmount}</td>
                        <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                        <td className="px-4 py-3"><StatusBadge status={order.orderStatus} /></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={order.orderStatus}
                            onValueChange={val => updateOrderStatus.mutate({ id: order.id, data: { orderStatus: val } })}
                          >
                            <SelectTrigger className="h-8 w-36 text-xs rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map(s => (
                                <SelectItem key={s} value={s} className="text-xs">{s.replace(/_/g, " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                    {!loadingOrders && !filteredOrders.length && (
                      <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Users</h2>
              <p className="text-sm text-muted-foreground">{users?.length ?? 0} registered users</p>
            </div>

            <Card className="shadow-sm border-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      {["#", "Name", "Email", "Phone", "Role", "Joined"].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingUsers && (
                      <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Loading users...</td></tr>
                    )}
                    {(users ?? []).map((u: any, i: number) => (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {u.createdAt ? format(new Date(u.createdAt), "dd MMM yyyy") : "—"}
                        </td>
                      </tr>
                    ))}
                    {!loadingUsers && !users?.length && (
                      <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <ProductDialog
        open={productDialog.open}
        onClose={() => setProductDialog({ open: false })}
        initial={productDialog.product ? {
          id: productDialog.product.id,
          name: productDialog.product.name ?? "",
          price: String(productDialog.product.price ?? ""),
          stock: String(productDialog.product.stock ?? "999"),
          category: productDialog.product.category ?? "learning",
          subcategory: productDialog.product.subcategory ?? "",
          slug: productDialog.product.slug ?? "",
          description: productDialog.product.description ?? "",
          coverImage: productDialog.product.coverImage ?? "",
        } : undefined}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
