import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI, paymentAPI, orderAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRazorpay } from "react-razorpay";

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { Razorpay } = useRazorpay();

  // Address form
  const [address, setAddress] = useState({
    address: user?.addresses?.[0]?.address || "",
    city: user?.addresses?.[0]?.city || "",
    state: user?.addresses?.[0]?.state || "",
    zip: user?.addresses?.[0]?.zip || "",
    country: user?.addresses?.[0]?.country || "India",
  });

  const fetchCart = async () => {
    try {
      const { data } = await cartAPI.get();
      setCart(data.cart || data.data || data);
    } catch { setCart(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (productId: string) => {
    try {
      await cartAPI.removeItem(productId);
      toast.success("Item removed");
      fetchCart();
    } catch { toast.error("Failed to remove item"); }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart(null);
      toast.success("Cart cleared");
    } catch { toast.error("Failed to clear cart"); }
  };

  const handleCheckout = async () => {
    if (!address.address || !address.city || !address.state || !address.zip) {
      toast.error("Please fill in your delivery address");
      return;
    }
    setProcessing(true);
    try {
      const { data } = await paymentAPI.createOrder();
      const options = {
        key: "rzp_test_S9gALXCPL6pHMv",
        amount: data.amount,
        currency: data.currency,
        name: "AETHERIA",
        description: "Order Payment",
        order_id: data.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentAPI.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            await orderAPI.create(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              address
            );

            toast.success("Payment successful! Order placed.");
            setCart(null);
            navigate("/orders");
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: { color: "#0f172a" },
      };
      const rzp = new Razorpay(options as any);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally { setProcessing(false); }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const items = cart?.products || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <button onClick={() => navigate("/products")} className="bg-primary text-primary-foreground px-6 py-2 font-medium hover:opacity-90 transition-opacity">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <div key={item.productId?._id || item.productId} className="flex gap-4 border border-border p-4 rounded-md">
                <div className="w-20 h-20 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                  {item.productId?.image?.[0] && (
                    <img src={item.productId.image[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {item.productId?.title || "Product"}
                  </h3>
                  <p className="text-sm text-muted-foreground tabular-nums">₹{item.priceAtPurchase?.toLocaleString()} × {item.quantity}</p>
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    ₹{(item.priceAtPurchase * item.quantity).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.productId?._id || item.productId)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-destructive hover:underline">Clear Cart</button>
          </div>

          {/* Checkout panel */}
          <div className="border border-border p-6 rounded-md h-fit space-y-4">
            <h3 className="font-semibold text-foreground">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground tabular-nums">₹{cart?.totalPrice?.toLocaleString()}</span>
            </div>

            <hr className="border-border" />

            <h4 className="text-sm font-medium text-foreground">Delivery Address</h4>
            <input
              placeholder="Address"
              value={address.address}
              onChange={(e) => setAddress({ ...address, address: e.target.value })}
              className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="ZIP"
                value={address.zip}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                placeholder="Country"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-primary text-primary-foreground py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {processing ? "Processing..." : "Pay with Razorpay"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
