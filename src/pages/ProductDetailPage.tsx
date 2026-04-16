import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, cartAPI, reviewAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.allSettled([productAPI.getById(id), reviewAPI.getByProduct(id)])
      .then(([pRes, rRes]) => {
        if (pRes.status === "fulfilled") setProduct(pRes.value.data.data.product || pRes.value.data.data || pRes.value.data);
        if (rRes.status === "fulfilled") setReviews(rRes.value.data.data.reviews || rRes.value.data.data || rRes.value.data || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setAdding(true);
    try {
      await cartAPI.add({ productId: product._id, quantity: qty, priceAtPurchase: product.discountedPrice });
      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally { setAdding(false); }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    try {
      await reviewAPI.add(id, { rating, comment });
      toast.success("Review submitted");
      const res = await reviewAPI.getByProduct(id);
      setReviews(res.data.data.reviews || res.data.data || res.data || []);
      setComment("");
      setRating(5);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!product) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Product not found</div>;

  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div>
          <div className="bg-secondary rounded-sm overflow-hidden aspect-square mb-4">
            <img
              src={product.image?.[selectedImg] || "https://via.placeholder.com/600"}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {product.image?.length > 1 && (
            <div className="flex gap-2">
              {product.image.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                    i === selectedImg ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{product.category}</p>
          <h1 className="text-3xl font-semibold tracking-tight mb-4 text-foreground">{product.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-semibold text-foreground tabular-nums">₹{product.discountedPrice.toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through tabular-nums">₹{product.price.toLocaleString()}</span>
                <span className="text-accent text-sm font-medium">{discount}% off</span>
              </>
            )}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating) ? "fill-warning text-warning" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.numberOfReviews} reviews)</span>
            </div>
          )}

          {product.description && (
            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
          )}

          <p className={`text-sm mb-6 ${product.stock > 0 ? "text-success" : "text-destructive"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {!isSeller && product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-md">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-secondary transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 tabular-nums text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-2 hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={addToCart}
                disabled={adding}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Reviews</h2>

        {isAuthenticated && !isSeller && (
          <form onSubmit={submitReview} className="border border-border p-6 rounded-md mb-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)}>
                    <Star className={`h-5 w-5 cursor-pointer ${s <= rating ? "fill-warning text-warning" : "text-border"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-input bg-background rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={3}
                maxLength={200}
                placeholder="Share your thoughts..."
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r._id} className="border border-border p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-warning text-warning" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
