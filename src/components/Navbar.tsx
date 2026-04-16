import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 lg:px-8">
        <Link to="/" className="text-2xl font-semibold tracking-tighter text-foreground">
          AETHERIA
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <Link to="/categories" className="hover:text-foreground transition-colors">Categories</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {!isSeller && (
                <Link to="/cart" className="relative p-2 hover:bg-secondary rounded-md transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              <Link to="/orders" className="p-2 hover:bg-secondary rounded-md transition-colors">
                <Package className="h-5 w-5" />
              </Link>
              {isSeller && (
                <Link to="/seller/dashboard" className="p-2 hover:bg-secondary rounded-md transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}
              <Link to="/profile" className="p-2 hover:bg-secondary rounded-md transition-colors">
                <User className="h-5 w-5" />
              </Link>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                {user?.role}
              </span>
              <button onClick={handleLogout} className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                Register
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <Link to="/products" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Products</Link>
          <Link to="/categories" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Categories</Link>
          {isAuthenticated ? (
            <>
              {!isSeller && <Link to="/cart" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Cart</Link>}
              <Link to="/orders" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Orders</Link>
              {isSeller && <Link to="/seller/dashboard" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
              <Link to="/profile" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block py-2 text-sm text-destructive">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
