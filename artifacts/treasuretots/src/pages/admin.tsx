import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAdminGetAnalytics, useAdminListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated && typeof window !== "undefined") {
    setLocation("/login");
    return null;
  }

  if (user?.role !== "admin") {
    return <div className="container p-20 text-center text-red-500 font-bold">Unauthorized. Admin access required.</div>;
  }

  const { data: analytics } = useAdminGetAnalytics();
  const { data: orders } = useAdminListOrders();

  const chartData = analytics?.monthlyRevenue || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-primary">₹{analytics?.totalRevenue || 0}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold">{analytics?.totalOrders || 0}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium mb-1">Active Users</p>
            <h3 className="text-3xl font-bold">{analytics?.activeUsers || 0}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium mb-1">Top Product</p>
            <h3 className="text-xl font-bold truncate">{analytics?.topProduct || "-"}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders?.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">#{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.orderStatus}</p>
                  </div>
                  <p className="font-bold text-primary">₹{order.totalAmount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}