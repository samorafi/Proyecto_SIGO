import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/Autenticacion/perfil", {
        credentials: 'include' // CRÍTICO: Envía el cookie
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data); // Guarda la data en el estado de React
        // Opcional: Persistir en localStorage por si acaso, aunque la fuente de verdad es el cookie.
        localStorage.setItem('user', JSON.stringify(data));
        return true;
      } else {
        // Si el cookie expiró o no existe (401 Unauthorized)
        setUser(null);
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      return false;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await fetch('/api/Autenticacion/logout', { credentials: 'include' });
    setUser(null);
    localStorage.removeItem('user');
  };

  const login = () => fetchUser();

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);