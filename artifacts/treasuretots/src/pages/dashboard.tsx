import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useListOrders, useListAddresses, useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Package, MapPin, User, Heart } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated && typeof window !== "undefined") {
    setLocation("/login");
    return null;
  }

  const { data: ordersData } = useListOrders({ query: { queryKey: ["listOrders"], enabled: !!user } });
  const { data: addressesData } = useListAddresses({ query: { queryKey: ["listAddresses"], enabled: !!user } });

  const handleLogout = () => {
    logout();
    setLocation("/");
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
                <CardDescription>Track and view your recent orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!ordersData?.length ? (
                  <div className="text-center py-10 text-muted-foreground">No orders found.</div>
                ) : (
                  ordersData.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-5">
                      <div className="flex flex-wrap justify-between gap-4 mb-4 border-b pb-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Order ID</p>
                          <p className="font-semibold">#{order.id.toString().padStart(6, '0')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Date</p>
                          <p className="font-semibold">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Amount</p>
                          <p className="font-semibold text-primary">₹{order.totalAmount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Status</p>
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-bold capitalize ${order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <div className="w-10 h-10 bg-muted rounded"></div>
                            <div className="flex-1">
                              <p className="font-medium">Product #{item.productId}</p>
                              <p className="text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
                <Button size="sm">Add New</Button>
              </CardHeader>
              <CardContent>
                {!addressesData?.length ? (
                  <div className="text-center py-10 text-muted-foreground">No saved addresses.</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addressesData.map((address: any) => (
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