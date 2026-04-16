import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderAPI, deliveryAPI } from "@/lib/api";

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    Promise.allSettled([orderAPI.getById(orderId), deliveryAPI.track(orderId)])
      .then(([oRes, dRes]) => {
        if (oRes.status === "fulfilled") setOrder(oRes.value.data.order || oRes.value.data.data || oRes.value.data);
        if (dRes.status === "fulfilled") setDelivery(dRes.value.data.delivery || dRes.value.data.data || dRes.value.data);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!order) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Order not found</div>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">Order Details</h1>
      <p className="text-sm text-muted-foreground mb-8">#{order._id}</p>

      {/* Status tracker */}
      <div className="flex items-center justify-between mb-8">
        {statusSteps.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              i <= currentStep ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            {i < statusSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-8 capitalize">
        {statusSteps.map((s) => <span key={s}>{s}</span>)}
      </div>

      {/* Items */}
      <div className="border border-border rounded-md p-4 mb-6 space-y-3">
        {order.products?.map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-foreground">{item.productId?.title || "Product"} × {item.quantity}</span>
            <span className="text-foreground tabular-nums">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <hr className="border-border" />
        <div className="flex justify-between font-semibold text-foreground">
          <span>Total</span>
          <span className="tabular-nums">₹{(order.totalPrice/100)?.toLocaleString() }</span>
        </div>
      </div>

      {order.address && (
        <div className="border border-border rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-foreground mb-1">Delivery Address</h3>
          <p className="text-sm text-muted-foreground">{order.address}</p>
        </div>
      )}

      {delivery && (
        <div className="border border-border rounded-md p-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Delivery Status</h3>
          <p className="text-sm text-muted-foreground capitalize">Status: {delivery.status}</p>
          {delivery.estimatedDeliveryTime && (
            <p className="text-sm text-muted-foreground">ETA: {new Date(delivery.estimatedDeliveryTime).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
