import { useEffect, useState } from "react";
import { productAPI, categoryAPI, orderAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, Package, X } from "lucide-react";
import { toast } from "sonner";

const SellerDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"products" | "orders" | "categories">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: "", price: "", discountedPrice: "", category: "", stock: "", description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Category form
  const [newCategory, setNewCategory] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, cRes] = await Promise.allSettled([
        productAPI.getAll(),
        orderAPI.getMyOrders(),
        categoryAPI.getAll(),
      ]);
      if (pRes.status === "fulfilled") {
        const allProducts = pRes.value.data.data.products || pRes.value.data.data || pRes.value.data || [];
        setProducts(allProducts.filter((p: any) => p.seller === user?._id || p.seller?._id === user?._id));
      }
      if (oRes.status === "fulfilled") setOrders(oRes.value.data.data.orders || oRes.value.data.data || oRes.value.data || []);
      if (cRes.status === "fulfilled") setCategories(cRes.value.data.data.categories || cRes.value.data.data || cRes.value.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setProductForm({ title: "", price: "", discountedPrice: "", category: "", stock: "", description: "" });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditProduct = (p: any) => {
    setProductForm({
      title: p.title, price: String(p.price), discountedPrice: String(p.discountedPrice),
      category: p.category, stock: String(p.stock), description: p.description || "",
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", productForm.title);
      fd.append("price", productForm.price);
      fd.append("discountedPrice", productForm.discountedPrice);
      fd.append("category", productForm.category);
      fd.append("stock", productForm.stock);
      fd.append("description", productForm.description);
      if (imageFile) fd.append("image", imageFile);

      if (editingId) {
        await productAPI.update(editingId, fd);
        toast.success("Product updated");
      } else {
        await productAPI.create(fd);
        toast.success("Product created");
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productAPI.delete(id);
      toast.success("Product deleted");
      fetchData();
    } catch { toast.error("Failed to delete"); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success("Order status updated");
      fetchData();
    } catch { toast.error("Failed to update status"); }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setSavingCategory(true);
    try {
      await categoryAPI.create({ name: newCategory.trim() });
      toast.success("Category added");
      setNewCategory("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add category");
    } finally { setSavingCategory(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryAPI.delete(id);
      toast.success("Category deleted");
      fetchData();
    } catch { toast.error("Failed to delete category"); }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">Seller Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-8">
        {(["products", "orders", "categories"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">My Products ({products.length})</h2>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSaveProduct} className="border border-border rounded-md p-6 mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">{editingId ? "Edit Product" : "New Product"}</h3>
                <button type="button" onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Title" value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" minLength={3} maxLength={100} />
                <input required placeholder="Category" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input required type="number" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" min="0" />
                <input required type="number" placeholder="Discounted Price" value={productForm.discountedPrice} onChange={(e) => setProductForm({ ...productForm, discountedPrice: e.target.value })} className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" min="0" />
                <input required type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" min="0" />
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="border border-input bg-background rounded-md px-3 py-2 text-sm" />
              </div>
              <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full border border-input bg-background rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" rows={3} maxLength={1000} />
              <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {products.map((p: any) => (
              <div key={p._id} className="flex items-center gap-4 border border-border p-4 rounded-md">
                <div className="w-14 h-14 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                  {p.image?.[0] && <img src={p.image[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{p.title}</h4>
                  <p className="text-sm text-muted-foreground tabular-nums">₹{p.discountedPrice.toLocaleString()} · Stock: {p.stock}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditProduct(p)} className="p-2 hover:bg-secondary rounded-md transition-colors">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDeleteProduct(p._id)} className="p-2 hover:bg-secondary rounded-md transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-muted-foreground text-center py-8">No products yet</p>}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="border border-border p-4 rounded-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Order #{order._id.slice(-8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums mt-1">₹{order.totalPrice?.toLocaleString()}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                  className="text-xs border border-input bg-background rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders received yet</p>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === "categories" && (
        <div>
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              minLength={2}
              maxLength={50}
            />
            <button type="submit" disabled={savingCategory} className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {savingCategory ? "Adding..." : "Add"}
            </button>
          </form>
          <div className="space-y-2">
            {categories.map((cat: any) => (
              <div key={cat._id} className="flex justify-between items-center border border-border p-3 rounded-md">
                <span className="capitalize text-foreground">{cat.name}</span>
                <button onClick={() => handleDeleteCategory(cat._id)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
