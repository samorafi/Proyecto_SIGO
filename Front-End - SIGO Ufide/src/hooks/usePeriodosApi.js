import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/services/apiClientService";

export function usePeriodosApi() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch("/api/Periodos?estado=true", {
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar los periodos");
      setPeriodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { periodos, loading, error, refresh: load };
}
