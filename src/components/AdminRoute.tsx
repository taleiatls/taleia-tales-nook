
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface AdminRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

const AdminRoute = ({ children, requireSuperAdmin = false }: AdminRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, isLoading: adminLoading, hasAdminAccess } = useAdminCheck();

  // Show loading while checking authentication and admin status
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check admin access
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!requireSuperAdmin && !hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
