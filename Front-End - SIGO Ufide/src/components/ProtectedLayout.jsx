import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  // Espera a que AuthContext termine de inicializar
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                Verificando tu sesión
              </h1>
              <p className="text-sm text-gray-500">
                Un momento, estamos confirmando tus permisos.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Seguridad</span>
              <span className="font-medium text-gray-700">SIGO</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Si tu sesión expiró, te redirigiremos al inicio de sesión automáticamente.
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario → redirige a login
  if (!user) return <Navigate to="/auth/sign-in" replace />;

  // Si hay usuario → renderiza children
  return children;
};

export default ProtectedLayout;
