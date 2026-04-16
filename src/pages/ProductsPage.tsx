import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI, categoryAPI } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      setCategories(res.data.data.categories || res.data.data || res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;

    productAPI.getAll(params).then((res) => {
      setProducts(res.data.data.products || res.data.data || res.data);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [activeCategory, search]);

  const handleCategoryClick = (name: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (activeCategory === name) {
      newParams.delete("category");
    } else {
      newParams.set("category", name);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">All Products</h1>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider border rounded-full transition-colors ${
                activeCategory === cat.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="bg-secondary rounded-sm aspect-[4/5]" />
              <div className="h-4 bg-secondary rounded w-2/3" />
              <div className="h-4 bg-secondary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p: any) => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-20">No products found.</p>
      )}
    </div>
  );
};

export default ProductsPage;
