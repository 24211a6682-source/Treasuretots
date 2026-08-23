import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListOrders,
  useAdminUpdateOrderStatus,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ── Constants ──────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["order_received", "making", "dispatched", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    refunded: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    delivered: "bg-green-500/20 text-green-400 border-green-500/30",
    dispatched: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    making: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    order_received: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${map[status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ── Order Detail Drawer ────────────────────────────────────────────────────────

function OrderDetailDrawer({
  order,
  onClose,
  onUpdateStatus,
  isUpdating,
}: {
  order: any;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  isUpdating: boolean;
}) {
  const [localStatus, setLocalStatus] = useState<string>(order.orderStatus);

  useEffect(() => {
    setLocalStatus(order.orderStatus);
  }, [order.orderStatus]);

  const addr = order.shippingAddress;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-gray-900 border-l border-gray-700 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Order #{order.id}</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a") : "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition text-xl"
          >
            ×
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.orderStatus} />
          </div>

          {/* Customer */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer</h3>
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-1.5">
              <p className="text-white font-semibold">{order.user?.name ?? "Guest"}</p>
              {order.user?.email && <p className="text-gray-400 text-sm">{order.user.email}</p>}
              {order.user?.phone && <p className="text-gray-400 text-sm">📞 {order.user.phone}</p>}
              {order.childName && (
                <p className="text-orange-400 text-sm mt-2">
                  🧒 Child name: <span className="font-bold">{order.childName}</span>
                </p>
              )}
            </div>
          </section>

          {/* Shipping Address */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shipping Address</h3>
            {addr ? (
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-1 text-sm text-gray-300">
                <p className="text-white font-semibold">{addr.fullName}</p>
                {addr.houseNo && <p>{addr.houseNo}{addr.street ? `, ${addr.street}` : ""}</p>}
                {addr.city && (
                  <p>
                    {addr.city}
                    {addr.state ? `, ${addr.state}` : ""}
                    {addr.pincode ? ` — ${addr.pincode}` : ""}
                  </p>
                )}
                {addr.phone && <p className="text-gray-400">📞 {addr.phone}</p>}
                {addr.landmark && <p className="text-gray-500 text-xs">Landmark: {addr.landmark}</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm bg-gray-800/50 rounded-xl p-4">No address on record</p>
            )}
          </section>

          {/* Items Ordered */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Items Ordered ({order.items?.length ?? 0})
            </h3>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
                  {item.product?.coverImage && (
                    <img
                      src={item.product.coverImage}
                      alt={item.product.name}
                      className="w-10 h-12 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.product?.name ?? "Product"}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Qty {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="text-orange-400 font-bold text-sm shrink-0">
                    ₹{(Number(item.quantity) * Number(item.price)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Info */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payment Details</h3>
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-2.5">
              <Row label="Total Amount" value={`₹${Number(order.totalAmount).toLocaleString("en-IN")}`} bold orange />
              {order.shippingAmount != null && (
                <Row label="Shipping" value={`₹${Number(order.shippingAmount).toLocaleString("en-IN")}`} />
              )}
              <Row label="Payment Status" value={<StatusBadge status={order.paymentStatus} />} />
              {order.razorpayPaymentId && (
                <Row
                  label="Razorpay Payment ID"
                  value={
                    <span className="font-mono text-xs text-gray-300 bg-gray-700/60 px-2 py-1 rounded-lg">
                      {order.razorpayPaymentId}
                    </span>
                  }
                />
              )}
              {order.razorpayOrderId && (
                <Row
                  label="Razorpay Order ID"
                  value={
                    <span className="font-mono text-xs text-gray-300 bg-gray-700/60 px-2 py-1 rounded-lg">
                      {order.razorpayOrderId}
                    </span>
                  }
                />
              )}
              {order.paymentMethod && (
                <Row label="Payment Method" value={order.paymentMethod} />
              )}
              {order.paidAt && (
                <Row
                  label="Paid At"
                  value={format(new Date(order.paidAt), "dd MMM yyyy, hh:mm a")}
                />
              )}
            </div>
          </section>
        </div>

        {/* Footer — update status */}
        <div className="px-6 py-4 border-t border-gray-800 shrink-0 bg-gray-900">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Update Order Status</p>
          <div className="flex gap-3">
            <select
              value={localStatus}
              onChange={e => setLocalStatus(e.target.value)}
              className="flex-1 h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <button
              onClick={() => onUpdateStatus(order.id, localStatus)}
              disabled={isUpdating || localStatus === order.orderStatus}
              className="px-5 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-orange-500/20"
            >
              {isUpdating ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  bold,
  orange,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`text-right ${bold ? "font-bold" : ""} ${orange ? "text-orange-400" : "text-gray-200"}`}>
        {value}
      </span>
    </div>
  );
}

// ── CSV Export ─────────────────────────────────────────────────────────────────

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  let str = String(value);
  // Neutralize spreadsheet formula injection: prefix dangerous leading characters
  if (str.length > 0 && ["=", "+", "-", "@", "\t", "\r"].includes(str[0])) {
    str = "'" + str;
  }
  // Quote cells that contain commas, double-quotes, or newlines
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportOrdersToCSV(orders: any[]) {
  const headers = [
    "Order ID",
    "Date",
    "Customer Name",
    "Phone",
    "Email",
    "Child Name",
    "Items",
    "Total Amount (₹)",
    "Shipping Amount (₹)",
    "Payment Status",
    "Order Status",
    "Razorpay Payment ID",
    "Shipping Address",
  ];

  const rows = orders.map((o: any) => {
    const addr = o.shippingAddress;
    const addressParts = addr
      ? [
          addr.fullName,
          addr.houseNo,
          addr.street,
          addr.city,
          addr.state,
          addr.pincode,
          addr.phone ? `Phone: ${addr.phone}` : "",
          addr.landmark ? `Landmark: ${addr.landmark}` : "",
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    const itemsSummary = (o.items ?? [])
      .map((item: any) => `${item.product?.name ?? "Product"} x${item.quantity}`)
      .join("; ");

    return [
      o.id,
      o.createdAt ? format(new Date(o.createdAt), "dd MMM yyyy HH:mm") : "",
      o.user?.name ?? "Guest",
      o.user?.phone ?? "",
      o.user?.email ?? "",
      o.childName ?? "",
      itemsSummary,
      Number(o.totalAmount ?? 0).toFixed(2),
      o.shippingAmount != null ? Number(o.shippingAmount).toFixed(2) : "",
      o.paymentStatus ?? "",
      o.orderStatus ?? "",
      o.razorpayPaymentId ?? "",
      addressParts,
    ].map(escapeCsvCell).join(",");
  });

  const csv = [headers.map(escapeCsvCell).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [payFilter, setPayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const isAdmin = user?.role === "admin";

  const { data: orders = [], isLoading: loadingOrders, isFetching, refetch } = useAdminListOrders(
    {},
    { query: { queryKey: ["adminOrders"], enabled: isAdmin, refetchInterval: 30_000 } },
  );

  const updateOrderStatus = useAdminUpdateOrderStatus({
    mutation: {
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: ["adminOrders"] });
        toast({ title: "Order status updated" });
        // Update selected order locally for immediate feedback
        if (selectedOrder && selectedOrder.id === vars.id) {
          setSelectedOrder((o: any) => ({ ...o, orderStatus: vars.data.orderStatus }));
        }
      },
      onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
    },
  });

  const handleUpdateStatus = useCallback(
    (id: number, status: string) => {
      updateOrderStatus.mutate({ id, data: { orderStatus: status } });
    },
    [updateOrderStatus],
  );

  const handleLogout = useCallback(() => {
    logout();
    setLocation("/admin/login");
  }, [logout, setLocation]);

  // ── Loading / auth ──────────────────────────────────────────────────────────

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

  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-white">Admin access required</h2>
        <button
          onClick={() => setLocation("/admin/login")}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filtered = (orders as any[]).filter((o: any) => {
    const matchPay = payFilter === "all" || o.paymentStatus === payFilter;
    const matchStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      String(o.id).includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.user?.phone?.includes(q) ||
      o.childName?.toLowerCase().includes(q) ||
      o.razorpayPaymentId?.toLowerCase().includes(q);
    return matchPay && matchStatus && matchSearch;
  });

  // ── Summary counts ──────────────────────────────────────────────────────────
  const allOrders = orders as any[];
  const paidCount = allOrders.filter((o: any) => o.paymentStatus === "paid").length;
  const pendingCount = allOrders.filter((o: any) => o.paymentStatus === "pending").length;
  const totalRevenue = allOrders
    .filter((o: any) => o.paymentStatus === "paid")
    .reduce((s: number, o: any) => s + Number(o.totalAmount ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-gray-950 border-r border-gray-800 flex flex-col z-40">
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

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { label: "Dashboard", icon: "📊", href: "/admin" },
            { label: "Orders", icon: "📋", href: "/admin/orders", active: true },
          ].map(item => (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <span className="text-base">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">Orders</h1>
            <p className="text-gray-500 text-xs mt-0.5">Manage all customer orders</p>
          </div>
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

        <main className="flex-1 p-8 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Orders", value: allOrders.length, icon: "📋", color: "from-blue-500/20 to-blue-600/10" },
              { label: "Paid Orders", value: paidCount, icon: "✅", color: "from-green-500/20 to-green-600/10" },
              { label: "Revenue (Paid)", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: "💰", color: "from-orange-500/20 to-orange-600/10" },
            ].map(card => (
              <div key={card.label} className={`bg-gradient-to-br ${card.color} border border-gray-700/50 rounded-2xl p-5`}>
                <div className="text-2xl mb-2">{card.icon}</div>
                <p className="text-gray-400 text-xs font-medium mb-1">{card.label}</p>
                <p className="text-white font-bold text-xl">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search order #, name, email, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 w-72"
            />
            <select
              value={payFilter}
              onChange={e => setPayFilter(e.target.value)}
              className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Payment</option>
              {PAYMENT_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            {(payFilter !== "all" || statusFilter !== "all" || search) && (
              <button
                onClick={() => { setPayFilter("all"); setStatusFilter("all"); setSearch(""); }}
                className="h-10 px-4 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition border border-gray-700"
              >
                Clear filters
              </button>
            )}
            <span className="text-gray-500 text-sm ml-auto">
              {filtered.length} of {allOrders.length} orders
            </span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-10 px-4 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white font-medium transition"
              title="Refresh orders"
            >
              <span className={isFetching ? "animate-spin inline-block" : ""}>🔄</span>
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => exportOrdersToCSV(allOrders)}
              disabled={allOrders.length === 0}
              className="h-10 px-4 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white font-medium transition"
              title={`Export all ${allOrders.length} order${allOrders.length !== 1 ? "s" : ""} to CSV`}
            >
              <span>⬇️</span> Export CSV
            </button>
          </div>

          {/* Pending payment highlight */}
          {pendingCount > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <p className="text-yellow-300 text-sm">
                <span className="font-bold">{pendingCount}</span> order{pendingCount !== 1 ? "s" : ""} with pending payment
              </p>
              <button
                onClick={() => setPayFilter("pending")}
                className="ml-auto text-yellow-400 text-xs underline hover:no-underline"
              >
                View
              </button>
            </div>
          )}

          {/* Orders table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["Order #", "Customer", "Items", "Amount", "Payment", "Order Status", "Date", "Quick Update"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {loadingOrders && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-gray-500 text-sm">Loading orders…</p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!loadingOrders && filtered.map((order: any) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-gray-300 font-mono text-xs bg-gray-800/60 px-2 py-1 rounded-lg">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium">{order.user?.name ?? "Guest"}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {order.user?.phone ?? order.user?.email ?? ""}
                        </p>
                        {order.childName && (
                          <p className="text-orange-400 text-xs mt-0.5">🧒 {order.childName}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">
                        {order.items?.length ?? 0}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-orange-400 font-bold">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                        {order.shippingAmount != null && Number(order.shippingAmount) > 0 && (
                          <p className="text-gray-500 text-xs">+₹{Number(order.shippingAmount)} shipping</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {order.createdAt ? format(new Date(order.createdAt), "dd MMM yy") : "—"}
                        {order.paidAt && (
                          <p className="text-green-500/70 mt-0.5">Paid {format(new Date(order.paidAt), "dd MMM yy")}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.orderStatus}
                          onChange={e => handleUpdateStatus(order.id, e.target.value)}
                          className="h-8 px-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}

                  {!loadingOrders && !filtered.length && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <p className="text-gray-500 text-sm">No orders match your filters</p>
                        {(payFilter !== "all" || statusFilter !== "all" || search) && (
                          <button
                            onClick={() => { setPayFilter("all"); setStatusFilter("all"); setSearch(""); }}
                            className="mt-3 text-orange-400 text-sm hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Order detail drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={updateOrderStatus.isPending}
        />
      )}
    </div>
  );
}
