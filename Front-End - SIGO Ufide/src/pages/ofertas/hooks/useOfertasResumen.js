import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/services/apiClientService";

export function useOfertasResumen(category) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (category == null) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(
        `/api/Ofertas/summary?category=${category}`,
        {
          credentials: "include", 
        }
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error cargando resumen de ofertas", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh: load,
  };
}
