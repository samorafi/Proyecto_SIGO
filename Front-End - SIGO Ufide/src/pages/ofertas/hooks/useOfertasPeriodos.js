import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/services/apiClientService";

export function useOfertasPeriodos(category) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (category == null) return;

    try {
      setLoading(true);
      setError("");

      const res = await apiFetch(`/api/Ofertas/periodos-resumen?category=${category}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar los períodos.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    loading,
    error,
    refresh: load,
  };
}