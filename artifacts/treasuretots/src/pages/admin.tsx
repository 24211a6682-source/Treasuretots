import { useState, useCallback, useEffect, useRef } from "react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = "analytics" | "products" | "orders" | "users";

type ProductFormData = {
  id?: number; name: string; price: string; stock: string;
  category: string; subcategory: string; slug: string;
  description: string; coverImage: string; isBuyable: boolean;
};
const emptyForm: ProductFormData = {
  name: "", price: "", stock: "999", category: "learning",
  subcategory: "", slug: "", description: "", coverImage: "", isBuyable: true,
};

const ORDER_STATUSES = ["order_received", "making", "dispatched", "delivered", "cancelled"];
const PIE_COLORS = ["#FF7A00", "#3b82f6", "#22c55e", "#a855f7", "#ef4444"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    failed: "bg-red-500/20 text-red-400",
    refunded: "bg-gray-500/20 text-gray-400",
    delivered: "bg-green-500/20 text-green-400",
    dispatched: "bg-blue-500/20 text-blue-400",
    making: "bg-orange-500/20 text-orange-400",
    order_received: "bg-purple-500/20 text-purple-400",
    cancelled: "bg-red-500/20 text-red-400",
    active: "bg-green-500/20 text-green-400",
    inactive: "bg-gray-500/20 text-gray-400",
    admin: "bg-orange-500/20 text-orange-400",
    user: "bg-blue-500/20 text-blue-400",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${map[status] ?? "bg-gray-500/20 text-gray-400"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Sidebar({ active, setActive, onLogout }: { active: Section; setActive: (s: Section) => void; onLogout: () => void }) {
  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "orders", label: "Orders", icon: "📋" },
    { id: "users", label: "Users", icon: "👥" },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-gray-950 border-r border-gray-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">TT</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Admin Panel</p>
            <p className="text-gray-500 text-xs mt-0.5">TreasureTots</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active === item.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <span className="text-base">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}

// ── Product Form Modal ─────────────────────────────────────────────────────────

function ProductModal({ form, setForm, onSave, onClose, isPending }: {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSave: (coverImageOverride?: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [coverIdx, setCoverIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const browseRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const addFiles = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setStagedFiles(prev => [...prev, ...imgs]);
  };

  const removeStaged = (i: number) => {
    setStagedFiles(f => f.filter((_, j) => j !== i));
    setCoverIdx(c => (i < c ? c - 1 : i === c ? 0 : c));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem("tt_token");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/v1/admin/products/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token ?? ""}` },
      body: fd,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json() as { url: string };
    return data.url;
  };

  const handleSave = async () => {
    if (stagedFiles.length > 0) {
      setUploading(true);
      try {
        const url = await uploadFile(stagedFiles[coverIdx]);
        setUploading(false);
        onSave(url);
      } catch {
        setUploading(false);
        alert("Image upload failed. Please try again or paste a URL instead.");
      }
    } else {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">{form.id ? "Edit Product" : "Add New Product"}</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {([
            { k: "name", label: "Product Name", type: "text", full: true },
            { k: "slug", label: "URL Slug", type: "text", full: false },
            { k: "price", label: "Price (₹)", type: "number", full: false },
            { k: "stock", label: "Stock", type: "number", full: false },
            { k: "description", label: "Description", type: "textarea", full: true },
          ] as { k: keyof ProductFormData; label: string; type: string; full: boolean }[]).map(({ k, label, type, full }) => (
            <div key={k} className={full ? "col-span-2" : ""}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
              {type === "textarea" ? (
                <textarea value={String(form[k])} onChange={set(k)} rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              ) : (
                <input type={type} value={String(form[k])} onChange={set(k)}
                  className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              )}
            </div>
          ))}

          {/* ── Image upload section ── */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-2">Product Image</label>

            {/* Drag & drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-xl p-5 text-center mb-3 transition-colors select-none ${
                dragOver ? "border-orange-500 bg-orange-500/10" : "border-gray-700 bg-gray-800/40"
              }`}
            >
              <p className="text-gray-400 text-sm">Drag &amp; drop images here or choose below</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-3">
              <button type="button" onClick={() => browseRef.current?.click()}
                className="flex-1 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium rounded-xl transition flex items-center justify-center gap-2">
                📁 Browse Files
              </button>
              <button type="button" onClick={() => cameraRef.current?.click()}
                className="flex-1 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium rounded-xl transition flex items-center justify-center gap-2">
                📷 Take Photo
              </button>
            </div>
            {/* Hidden inputs */}
            <input ref={browseRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />

            {/* Staged file thumbnails */}
            {stagedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {stagedFiles.map((file, i) => (
                  <div key={i} className="relative cursor-pointer" onClick={() => setCoverIdx(i)}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className={`w-20 h-24 object-contain rounded-xl border-2 transition bg-gray-800 ${
                        coverIdx === i ? "border-orange-500" : "border-gray-700 opacity-70"
                      }`}
                    />
                    {coverIdx === i && (
                      <span className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-tight">
                        COVER
                      </span>
                    )}
                    <button type="button"
                      onClick={e => { e.stopPropagation(); removeStaged(i); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold leading-none">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing URL preview when no staged files */}
            {stagedFiles.length === 0 && form.coverImage && (
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <img src={form.coverImage} alt="Current cover"
                    className="w-20 h-24 object-contain rounded-xl border-2 border-orange-500 bg-gray-800"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-tight">COVER</span>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, coverImage: "" }))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold leading-none">
                    ×
                  </button>
                </div>
                <p className="text-gray-500 text-xs">Upload new files above to replace this image.</p>
              </div>
            )}

            {/* URL paste fallback */}
            <input type="text" value={form.coverImage} onChange={set("coverImage")}
              placeholder="Or paste image URL directly…"
              className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={set("category")}
              className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {["learning", "flashcards", "labels", "wallpapers"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Subcategory</label>
            <input
              type="text"
              value={form.subcategory}
              onChange={set("subcategory")}
              className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="isBuyable"
              checked={form.isBuyable}
              onChange={e => setForm(f => ({ ...f, isBuyable: e.target.checked }))}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="isBuyable" className="text-sm text-gray-300 font-medium">Is Buyable (Add to Cart enabled)</label>
          </div>
        </div>
        <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || uploading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-60 shadow-lg shadow-orange-500/20 flex items-center gap-2"
          >
            {uploading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading…</>
            ) : isPending ? "Saving…" : form.id ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Restock Modal ──────────────────────────────────────────────────────────────

function RestockModal({ product, onSave, onClose }: { product: any; onSave: (qty: number) => void; onClose: () => void }) {
  const [qty, setQty] = useState(String(product.stock ?? 999));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-1">Restock Product</h2>
        <p className="text-gray-400 text-sm mb-5">{product.name}</p>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">New Stock Quantity</label>
        <input
          type="number"
          value={qty}
          onChange={e => setQty(e.target.value)}
          className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mb-5"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">Cancel</button>
          <button onClick={() => onSave(Number(qty))} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition">Update Stock</button>
        </div>
      </div>
    </div>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────────

function AnalyticsSection({ analytics, orders, loadingAnalytics }: { analytics: any; orders: any[]; loadingAnalytics: boolean }) {
  const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
    acc[o.orderStatus] = (acc[o.orderStatus] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: "💰", color: "from-orange-500/20 to-orange-600/10" },
          { label: "Total Orders", value: analytics?.totalOrders ?? 0, icon: "📦", color: "from-blue-500/20 to-blue-600/10" },
          { label: "Registered Users", value: analytics?.activeUsers ?? 0, icon: "👥", color: "from-green-500/20 to-green-600/10" },
          { label: "Best Seller", value: analytics?.topProduct ?? "—", icon: "⭐", color: "from-purple-500/20 to-purple-600/10" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} border border-gray-700/50 rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
            <p className="text-white font-bold text-xl truncate">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Monthly Revenue</h3>
          {loadingAnalytics ? (
            <div className="h-52 flex items-center justify-center text-gray-500 text-sm">Loading…</div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.monthlyRevenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 12 }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(v: number) => [`₹${v}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#FF7A00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Orders by Status</h3>
          {pieData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-500 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Recent Orders</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-800">
            {["Order", "Customer", "Total", "Payment", "Status", "Date"].map(h => (
              <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-800/60">
            {orders.slice(0, 6).map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-3 text-gray-300 font-mono text-xs">#{o.id}</td>
                <td className="px-6 py-3 text-white font-medium">{o.user?.name ?? "Guest"}</td>
                <td className="px-6 py-3 text-orange-400 font-bold">₹{o.totalAmount}</td>
                <td className="px-6 py-3"><StatusBadge status={o.paymentStatus} /></td>
                <td className="px-6 py-3"><StatusBadge status={o.orderStatus} /></td>
                <td className="px-6 py-3 text-gray-500 text-xs">{o.createdAt ? format(new Date(o.createdAt), "dd MMM yy") : "—"}</td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsSection({ products, loadingProducts, onEdit, onDelete, onRestock, onAdd }: any) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = (products ?? []).filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 w-56"
          />
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            {["learning", "flashcards", "labels", "wallpapers"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button
          onClick={onAdd}
          className="h-10 px-5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          + Add New Product
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-800">
            {["Image", "Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-800/60">
            {loadingProducts && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-sm">Loading…</td></tr>}
            {filtered.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-3">
                  <img src={p.coverImage || p.images?.[0]} alt={p.name} className="w-10 h-14 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).src = "/assets/images/logo.png"; }} />
                </td>
                <td className="px-5 py-3">
                  <p className="text-white font-semibold">{p.name}</p>
                  <p className="text-gray-500 text-xs">{p.slug}</p>
                </td>
                <td className="px-5 py-3"><StatusBadge status={p.category} /></td>
                <td className="px-5 py-3 text-orange-400 font-bold">{p.price != null ? `₹${p.price}` : "—"}</td>
                <td className="px-5 py-3 text-gray-300">{p.stock ?? "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={p.isActive ? "active" : "inactive"} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition">Edit</button>
                    <button onClick={() => onRestock(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:bg-green-500/10 transition">Restock</button>
                    <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) onDelete(p.id); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loadingProducts && !filtered.length && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-sm">No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersSection({ orders, loadingOrders, onUpdateStatus }: any) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [payFilter, setPayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (orders ?? []).filter((o: any) =>
    (payFilter === "all" || o.paymentStatus === payFilter) &&
    (statusFilter === "all" || o.orderStatus === statusFilter)
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="all">All Payment</option>
          {["pending", "paid", "failed", "refunded"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="all">All Status</option>
          {ORDER_STATUSES.map(s => <option key={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <span className="flex items-center text-gray-400 text-sm ml-1">{filtered.length} orders</span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-800">
            {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", "Update"].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-800/60">
            {loadingOrders && <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500 text-sm">Loading…</td></tr>}
            {filtered.flatMap((order: any) => [
              <tr
                key={order.id}
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="hover:bg-gray-800/40 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3 text-gray-300 font-mono text-xs">#{order.id}</td>
                <td className="px-5 py-3">
                  <p className="text-white font-semibold">{order.user?.name ?? "Guest"}</p>
                  <p className="text-gray-500 text-xs">{order.user?.phone ?? order.user?.email ?? ""}</p>
                </td>
                <td className="px-5 py-3 text-gray-400">{order.items?.length ?? 0}</td>
                <td className="px-5 py-3 text-orange-400 font-bold">₹{order.totalAmount}</td>
                <td className="px-5 py-3"><StatusBadge status={order.paymentStatus} /></td>
                <td className="px-5 py-3"><StatusBadge status={order.orderStatus} /></td>
                <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {order.createdAt ? format(new Date(order.createdAt), "dd MMM yy") : "—"}
                </td>
                <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                  <select
                    value={order.orderStatus}
                    onChange={e => onUpdateStatus(order.id, e.target.value)}
                    className="h-8 px-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </td>
              </tr>,
              expandedId === order.id && (
                <tr key={`${order.id}-expanded`} className="bg-gray-800/30">
                  <td colSpan={8} className="px-8 py-5">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shipping Address</p>
                        {order.shippingAddress ? (
                          <div className="text-sm text-gray-300 space-y-0.5">
                            <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.houseNo}, {order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                            <p className="text-gray-500">{order.shippingAddress.phone}</p>
                          </div>
                        ) : <p className="text-gray-500 text-sm">No address</p>}
                        {order.childName && <p className="mt-2 text-sm text-orange-400">Child Name: <span className="font-bold">{order.childName}</span></p>}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items Ordered</p>
                        <div className="space-y-2">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3">
                              {item.product?.coverImage && <img src={item.product.coverImage} alt={item.product.name} className="w-8 h-10 object-cover rounded" />}
                              <div>
                                <p className="text-white text-sm font-medium">{item.product?.name ?? "Product"}</p>
                                <p className="text-gray-400 text-xs">Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ),
            ])}
            {!loadingOrders && !filtered.length && <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500 text-sm">No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersSection({ users, loadingUsers, onToggleRole }: any) {
  const [search, setSearch] = useState("");
  const filtered = (users ?? []).filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 w-72"
      />

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-800">
            {["#", "Name", "Email", "Phone", "Role", "Joined", "Action"].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-800/60">
            {loadingUsers && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-sm">Loading…</td></tr>}
            {filtered.map((u: any, i: number) => (
              <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-3 text-gray-500 text-xs">{i + 1}</td>
                <td className="px-5 py-3 text-white font-semibold">{u.name}</td>
                <td className="px-5 py-3 text-gray-400">{u.email ?? "—"}</td>
                <td className="px-5 py-3 text-gray-400">{u.phone ?? "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={u.role} /></td>
                <td className="px-5 py-3 text-gray-500 text-xs">{u.createdAt ? format(new Date(u.createdAt), "dd MMM yy") : "—"}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => onToggleRole(u.id, u.role === "admin" ? "user" : "admin")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      u.role === "admin"
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-orange-400 hover:bg-orange-500/10"
                    }`}
                  >
                    {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
            {!loadingUsers && !filtered.length && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-sm">No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────────────

export default function Admin() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeSection, setActiveSection] = useState<Section>("analytics");
  const [productModal, setProductModal] = useState<{ open: boolean; form: ProductFormData }>({ open: false, form: emptyForm });
  const [restockModal, setRestockModal] = useState<{ open: boolean; product: any }>({ open: false, product: null });

  // Auth guard — effect only, never during render
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // ── ALL hooks must be called before any conditional returns ──────────────────
  const isAdmin = user?.role === "admin";

  const { data: analytics, isLoading: loadingAnalytics } = useAdminGetAnalytics({ query: { queryKey: ["adminAnalytics"], enabled: isAdmin } });
  const { data: products, isLoading: loadingProducts } = useAdminListProducts({ query: { queryKey: ["adminProducts"], enabled: isAdmin } });
  const { data: orders = [], isLoading: loadingOrders } = useAdminListOrders({}, { query: { queryKey: ["adminOrders"], enabled: isAdmin } });
  const { data: users = [], isLoading: loadingUsers } = useAdminListUsers({ query: { queryKey: ["adminUsers"], enabled: isAdmin } });

  const updateOrderStatus = useAdminUpdateOrderStatus({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminOrders"] }); toast({ title: "Order status updated" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    }
  });
  const deleteProduct = useAdminDeleteProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminProducts"] }); toast({ title: "Product deleted" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    }
  });
  const createProduct = useAdminCreateProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminProducts"] }); setProductModal({ open: false, form: emptyForm }); toast({ title: "Product added" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    }
  });
  const updateProduct = useAdminUpdateProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminProducts"] }); setProductModal({ open: false, form: emptyForm }); toast({ title: "Product updated" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    }
  });

  // ── Callbacks (must be before any early returns) ─────────────────────────────

  const handleSaveProduct = useCallback((coverImageOverride?: string) => {
    const { id, name, slug, category, subcategory, description, coverImage, price, stock, isBuyable } = productModal.form;
    const finalImage = coverImageOverride ?? coverImage;
    const payload = {
      name, slug, category,
      subcategory: subcategory || undefined,
      description: description || undefined,
      coverImage: finalImage,
      images: finalImage ? [finalImage] : [],
      price: price ? Number(price) : undefined,
      stock: stock ? Number(stock) : 999,
      isBuyable,
    };
    if (id) updateProduct.mutate({ id, data: payload });
    else createProduct.mutate({ data: payload });
  }, [productModal.form, updateProduct, createProduct]);

  const handleUpdateStock = useCallback((product: any, qty: number) => {
    updateProduct.mutate({ id: product.id, data: { stock: qty } });
    setRestockModal({ open: false, product: null });
    toast({ title: "Stock updated" });
  }, [updateProduct, toast]);

  const handleToggleRole = useCallback(async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem("tt_token");
      const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({ title: `User role updated to ${newRole}` });
    } catch {
      toast({ title: "Failed to update role", variant: "destructive" });
    }
  }, [qc, toast]);

  const handleLogout = useCallback(() => { logout(); setLocation("/admin/login"); }, [logout, setLocation]);

  // ── Conditional renders (safe now that all hooks are above) ──────────────────

  // Still loading auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect handled by effect above, show nothing
  if (!isAuthenticated) return null;

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-white">Admin access required</h2>
        <button onClick={() => setLocation("/admin/login")} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition">
          Go to Admin Login
        </button>
      </div>
    );
  }

  const SECTION_TITLES: Record<Section, string> = {
    analytics: "Analytics", products: "Products", orders: "Orders", users: "Users"
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar active={activeSection} setActive={setActiveSection} onLogout={handleLogout} />

      {/* Main content */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">{SECTION_TITLES[activeSection]}</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          {activeSection === "analytics" && (
            <AnalyticsSection analytics={analytics} orders={orders as any[]} loadingAnalytics={loadingAnalytics} />
          )}
          {activeSection === "products" && (
            <ProductsSection
              products={products}
              loadingProducts={loadingProducts}
              onAdd={() => setProductModal({ open: true, form: emptyForm })}
              onEdit={(p: any) => setProductModal({ open: true, form: {
                id: p.id, name: p.name ?? "", price: String(p.price ?? ""), stock: String(p.stock ?? 999),
                category: p.category ?? "learning", subcategory: p.subcategory ?? "",
                slug: p.slug ?? "", description: p.description ?? "",
                coverImage: p.coverImage ?? "", isBuyable: p.isBuyable ?? true,
              }})}
              onDelete={(id: number) => deleteProduct.mutate({ id })}
              onRestock={(p: any) => setRestockModal({ open: true, product: p })}
            />
          )}
          {activeSection === "orders" && (
            <OrdersSection
              orders={orders as any[]}
              loadingOrders={loadingOrders}
              onUpdateStatus={(id: number, status: string) => updateOrderStatus.mutate({ id, data: { orderStatus: status } })}
            />
          )}
          {activeSection === "users" && (
            <UsersSection
              users={users as any[]}
              loadingUsers={loadingUsers}
              onToggleRole={handleToggleRole}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {productModal.open && (
        <ProductModal
          form={productModal.form}
          setForm={f => setProductModal(m => ({ ...m, form: typeof f === "function" ? f(m.form) : f }))}
          onSave={handleSaveProduct}
          onClose={() => setProductModal({ open: false, form: emptyForm })}
          isPending={createProduct.isPending || updateProduct.isPending}
        />
      )}
      {restockModal.open && restockModal.product && (
        <RestockModal
          product={restockModal.product}
          onSave={qty => handleUpdateStock(restockModal.product, qty)}
          onClose={() => setRestockModal({ open: false, product: null })}
        />
      )}
    </div>
  );
}
