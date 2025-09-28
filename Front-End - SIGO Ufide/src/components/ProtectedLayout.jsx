import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  // Espera a que AuthContext termine de inicializar
  if (loading) return <div>Cargando...</div>;

  // Si no hay usuario → redirige a login
  if (!user) return <Navigate to="/auth/sign-in" replace />;

  // Si hay usuario → renderiza children
  return children;
};

export default ProtectedLayout;
