import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  useListOrders, useListAddresses, useUpdateProfile, useCreateAddress, AddressInput
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogOut, Package, MapPin, User, Plus, X, Loader2, ChevronDown, ChevronUp, CreditCard, Truck } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const emptyAddress: AddressInput = {
  fullName: "",
  phone: "",
  houseNo: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

type PaymentStatus = "pending" | "paid" | "failed" | string;
type OrderStatus = "processing" | "dispatched" | "delivered" | "cancelled" | "completed" | string;

function paymentStatusBadge(status: PaymentStatus) {
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

function orderStatusBadge(status: OrderStatus) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    delivered: "bg-green-100 text-green-800",
    dispatched: "bg-blue-100 text-blue-800",
    processing: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-orange-100 text-orange-800";
}

function OrderRow({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const addr = order.shippingAddress as any;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Summary row — always visible */}
      <button
        type="button"
        className="w-full text-left p-5 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Order ID</p>
            <p className="font-semibold">#{order.id.toString().padStart(6, "0")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Date</p>
            <p className="font-semibold">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total</p>
            <p className="font-semibold text-primary">₹{order.totalAmount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Payment</p>
            <span className={`inline-flex px-2 py-1 rounded text-xs font-bold capitalize ${paymentStatusBadge(order.paymentStatus)}`}>
              {order.paymentStatus}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-flex px-2 py-1 rounded text-xs font-bold capitalize ${orderStatusBadge(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
          <div className="flex items-center self-center text-muted-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Item thumbnails preview when collapsed */}
        {!expanded && order.items?.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {order.items.slice(0, 4).map((item: any) => (
              <div key={item.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {item.product?.coverImage ? (
                  <img
                    src={item.product.coverImage}
                    alt={item.product.name ?? "Product"}
                    className="w-8 h-8 rounded object-cover bg-muted"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted" />
                )}
                <span className="max-w-[120px] truncate">{item.product?.name ?? `Product #${item.productId}`}</span>
                <span>×{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 4 && (
              <span className="text-xs text-muted-foreground self-center">+{order.items.length - 4} more</span>
            )}
          </div>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t bg-muted/10 p-5 space-y-6">
          {/* Items */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Items Ordered
            </h4>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  {item.product?.coverImage ? (
                    <img
                      src={item.product.coverImage}
                      alt={item.product.name ?? "Product"}
                      className="w-12 h-12 rounded object-cover bg-muted flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product?.name ?? `Product #${item.productId}`}</p>
                    {item.product?.category && (
                      <p className="text-xs text-muted-foreground capitalize">{item.product.category}</p>
                    )}
                    <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold flex-shrink-0">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {addr && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" /> Shipping Address
              </h4>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{addr.fullName}</p>
                <p>{addr.houseNo}, {addr.street}</p>
                <p>{addr.city}, {addr.state} – {addr.pincode}</p>
                {addr.phone && <p>Ph: {addr.phone}</p>}
              </div>
            </div>
          )}

          {/* Payment info */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Info
            </h4>
            <div className="text-sm space-y-1">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-36">Payment Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold capitalize ${paymentStatusBadge(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.razorpayOrderId && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-36">Razorpay Order ID</span>
                  <span className="font-mono text-xs break-all">{order.razorpayOrderId}</span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-36">Payment ID</span>
                  <span className="font-mono text-xs break-all">{order.razorpayPaymentId}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-36">Paid At</span>
                  <span>{format(new Date(order.paidAt), "MMM dd, yyyy h:mm a")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressInput>({ ...emptyAddress });

  if (!isAuthenticated && typeof window !== "undefined") {
    setLocation("/login");
    return null;
  }

  // Poll every 30 seconds so status updates (dispatched, delivered) appear without a page refresh
  const { data: ordersData, isLoading: ordersLoading } = useListOrders({
    query: {
      queryKey: ["listOrders"],
      enabled: !!user,
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
    },
  });
  const { data: addressesData, refetch: refetchAddresses } = useListAddresses({
    query: { queryKey: ["listAddresses"], enabled: !!user },
  });
  const createAddress = useCreateAddress();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress.mutateAsync({ data: newAddress });
      toast({ title: "Address saved!", description: "Your address has been added." });
      setNewAddress({ ...emptyAddress });
      setShowAddForm(false);
      refetchAddresses();
    } catch {
      toast({ title: "Failed to save address", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="orders" className="w-full flex flex-col md:flex-row gap-8">
        <TabsList className="md:flex-col md:w-64 h-auto p-2 bg-muted/20 items-start justify-start gap-2 flex-wrap">
          <TabsTrigger value="orders" className="w-full justify-start gap-3 p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Package className="w-5 h-5" /> My Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="w-full justify-start gap-3 p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-5 h-5" /> Profile Settings
          </TabsTrigger>
          <TabsTrigger value="addresses" className="w-full justify-start gap-3 p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MapPin className="w-5 h-5" /> Addresses
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="orders" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track and view your recent orders · updates every 30 seconds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordersLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !ordersData?.length ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No orders yet</p>
                    <p className="text-sm mt-1">Your orders will appear here after you make a purchase.</p>
                  </div>
                ) : (
                  ordersData.map((order: any) => (
                    <OrderRow key={order.id} order={order} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user?.email || ""} readOnly disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={user?.phone || ""} />
                  </div>
                  <Button type="button" className="mt-4">Update Profile</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={() => { setShowAddForm(v => !v); setNewAddress({ ...emptyAddress }); }}
                  variant={showAddForm ? "outline" : "default"}
                >
                  {showAddForm ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><Plus className="w-4 h-4 mr-1" /> Add New</>}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {showAddForm && (
                  <form onSubmit={handleAddAddress} className="border rounded-lg p-5 bg-muted/20 space-y-4">
                    <h3 className="font-semibold text-sm">New Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="a-fullName">Full Name</Label>
                        <Input id="a-fullName" required value={newAddress.fullName}
                          onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="a-phone">Phone Number</Label>
                        <Input id="a-phone" required value={newAddress.phone}
                          onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="a-houseNo">House No. / Flat / Building</Label>
                      <Input id="a-houseNo" required value={newAddress.houseNo}
                        onChange={e => setNewAddress({ ...newAddress, houseNo: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="a-street">Street / Area / Locality</Label>
                      <Input id="a-street" required value={newAddress.street}
                        onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="a-pincode">Pincode</Label>
                        <Input id="a-pincode" required value={newAddress.pincode}
                          onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="a-city">City</Label>
                        <Input id="a-city" required value={newAddress.city}
                          onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="a-state">State</Label>
                        <Input id="a-state" required value={newAddress.state}
                          onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Checkbox
                        id="a-isDefault"
                        checked={!!newAddress.isDefault}
                        onCheckedChange={(checked) => setNewAddress({ ...newAddress, isDefault: !!checked })}
                      />
                      <label htmlFor="a-isDefault" className="text-sm font-medium">Set as default address</label>
                    </div>
                    <Button type="submit" className="w-full" disabled={createAddress.isPending}>
                      {createAddress.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Address"}
                    </Button>
                  </form>
                )}

                {!addressesData?.length && !showAddForm ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No saved addresses yet.</p>
                    <p className="text-sm mt-1">Click "Add New" to save your delivery address.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addressesData?.map((address: any) => (
                      <div key={address.id} className="border rounded-lg p-4 relative">
                        {address.isDefault && (
                          <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">Default</span>
                        )}
                        <p className="font-bold mb-1">{address.fullName}</p>
                        <p className="text-sm text-muted-foreground">{address.houseNo}, {address.street}</p>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.pincode}</p>
                        <p className="text-sm mt-2 font-medium">Ph: {address.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
