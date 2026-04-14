import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RequirePermission({ permiso, children }) {
  const { isAuthenticated, loading, loadingPermisos, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated)
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;

  if (loadingPermisos) return null;

  if (permiso && !hasPermission(permiso)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
