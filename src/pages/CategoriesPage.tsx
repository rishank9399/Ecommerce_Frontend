import { useEffect, useState } from "react";
import { categoryAPI } from "@/lib/api";
import { Link } from "react-router-dom";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryAPI.getAll()
      .then(({ data }) => setCategories(data.categories || data.data || data || []))
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
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">Categories</h1>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat: any) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.name}`}
              className="p-8 border border-border hover:bg-secondary transition-colors text-center"
            >
              <h3 className="text-xl font-medium capitalize text-foreground">{cat.name}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-20">No categories available.</p>
      )}
    </div>
  );
};

export default CategoriesPage;
