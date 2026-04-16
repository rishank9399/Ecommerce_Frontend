import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productAPI, categoryAPI } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, ShoppingBag, Truck, Shield } from "lucide-react";

const HomePage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          productAPI.getAll(),
          categoryAPI.getAll(),
        ]);
        if (prodRes.status === "fulfilled") setProducts((prodRes.value.data.data.products || prodRes.value.data.data || prodRes.value.data).slice(0, 6));
        if (catRes.status === "fulfilled") setCategories((catRes.value.data.data.categories || catRes.value.data.data || catRes.value.data).slice(0, 4));
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-foreground mb-6">
            Precision crafted for the modern lifestyle.
          </h1>
          <p className="text-lg text-muted-foreground max-w-[50ch] mb-8">
            Discover curated collections from independent sellers. Secure payments powered by Razorpay.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-semibold hover:opacity-90 transition-opacity"
          >
            View Catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.name}`}
                className="p-6 border border-border hover:bg-secondary transition-colors"
              >
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Category</div>
                <h3 className="text-xl font-medium capitalize text-foreground">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container mx-auto px-4 lg:px-8 mb-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Featured Selections</h2>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="bg-secondary rounded-sm aspect-[4/5]" />
                <div className="h-4 bg-secondary rounded w-2/3" />
                <div className="h-4 bg-secondary rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">No products available yet.</p>
        )}
      </section>

      {/* Trust bar */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-foreground">Curated Selection</h4>
              <p className="text-sm text-muted-foreground">Hand-picked products from verified sellers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-foreground">Secure Payments</h4>
              <p className="text-sm text-muted-foreground">Powered by Razorpay</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Truck className="h-6 w-6 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-foreground">Order Tracking</h4>
              <p className="text-sm text-muted-foreground">Real-time delivery updates</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
