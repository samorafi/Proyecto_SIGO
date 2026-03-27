import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "@/hooks/useAlert";
import { apiFetch, setUnauthorizedHandler } from "@/services/apiClientService";

const AuthContext = createContext();

function extractUserId(u) {
  return (
    u?.usuarioId ??
    u?.userId ??
    u?.id ??
    u?.personaId ??
    u?.persona_id ??
    null
  );
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [permisos, setPermisos] = useState(new Set());
  const [loadingPermisos, setLoadingPermisos] = useState(true);

  const navigate = useNavigate();
  const alert = useAlert();

  const clearAuthState = () => {
    setUser(null);
    setPermisos(new Set());
  };

  const handleSessionExpired = async () => {
    clearAuthState();

    await alert.warning(
      "Sesión caducada",
      "Tu sesión ha expirado por inactividad. Debes iniciar sesión nuevamente."
    );

    navigate("/auth/sign-in", { replace: true });
  };

  const fetchPermisos = async (u) => {
    setLoadingPermisos(true);

    try {
      const id = extractUserId(u);

      if (!id) {
        setPermisos(new Set());
        return;
      }

      const res = await apiFetch(`/api/Roles/usuario/${id}/permisos`);

      if (!res.ok) {
        setPermisos(new Set());
        return;
      }

      const data = await res.json();
      const raw = Array.isArray(data) ? data : data?.permisos ?? [];

      const claves = raw
        .map((x) => (typeof x === "string" ? x : x?.clave))
        .filter(Boolean);

      setPermisos(new Set(claves));
    } catch {
      setPermisos(new Set());
    } finally {
      setLoadingPermisos(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true);

    try {
      const res = await apiFetch("/api/Autenticacion/perfil");

      if (!res.ok) {
        clearAuthState();
        return false;
      }

      const data = await res.json();
      setUser(data);

      await fetchPermisos(data);

      return true;
    } catch {
      clearAuthState();
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(handleSessionExpired);
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const res = await apiFetch("/api/Autenticacion/logout", {
        method: "POST",
      });

      if (!res.ok) {
        console.error("Error al cerrar sesión");
      }
    } finally {
      clearAuthState();
      navigate("/auth/sign-in", { replace: true });
    }
  };

  const login = () => fetchUser();

  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      loading,
      permisos,
      loadingPermisos,
      isAuthenticated,
      hasPermission: (perm) => !perm || permisos.has(perm),
    }),
    [user, loading, permisos, loadingPermisos, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);