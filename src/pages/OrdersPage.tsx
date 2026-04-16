import { useEffect, useState } from "react";
import { orderAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-primary/10 text-primary",
  shipped: "bg-accent/10 text-accent",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(({ data }) => setOrders(data.orders || data.data || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link
              to={`/orders/${order._id}`}
              key={order._id}
              className="block border border-border p-4 rounded-md hover:bg-secondary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">Order #{order._id.slice(-8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-secondary text-foreground"}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-foreground">{order.products?.length || 0} item(s)</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">₹{order.totalPrice?.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
