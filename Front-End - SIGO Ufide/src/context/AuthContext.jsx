import { createContext, useContext, useState, useEffect, useMemo } from "react";

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

  // Permisos
  const [permisos, setPermisos] = useState(new Set());
  const [loadingPermisos, setLoadingPermisos] = useState(true);

  const fetchPermisos = async (u) => {
    setLoadingPermisos(true);
    try {
      // 1) Intento recomendado: endpoint que infiere el usuario por cookie/claims
      let res = await fetch("/api/Roles/me/permisos", { credentials: "include" });

      // 2) Fallback: endpoint por id (si el anterior no existe)
      if (!res.ok) {
        const id = extractUserId(u);
        if (!id) {
          setPermisos(new Set());
          return;
        }

        res = await fetch(`/api/Roles/usuario/${id}/permisos`, {
          credentials: "include",
        });
      }

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
      const res = await fetch("/api/Autenticacion/perfil", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));

        // Cargar permisos al tener usuario
        await fetchPermisos(data);

        return true;
      } else {
        setUser(null);
        setPermisos(new Set());
        localStorage.removeItem("user");
        return false;
      }
    } catch {
      setUser(null);
      setPermisos(new Set());
      localStorage.removeItem("user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await fetch("/api/Autenticacion/logout", { credentials: "include" });
    setUser(null);
    setPermisos(new Set());
    localStorage.removeItem("user");
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
