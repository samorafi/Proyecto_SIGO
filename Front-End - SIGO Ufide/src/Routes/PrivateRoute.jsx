import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <div>Cargando...</div>; // opcional: loader mientras revisa localStorage

  return token ? children : <Navigate to="/login" replace />;
};
