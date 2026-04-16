import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, sellerOnly = false }: { children: React.ReactNode; sellerOnly?: boolean }) => {
  const { isAuthenticated, isSeller, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (sellerOnly && !isSeller) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
