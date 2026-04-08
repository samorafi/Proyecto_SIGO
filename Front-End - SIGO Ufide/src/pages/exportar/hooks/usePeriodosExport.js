import { useEffect, useState } from "react";
import { apiFetch } from "@/services/apiClientService";

/**
 * Hook ligero que solo carga la lista de períodos.
 * Evita cargar todos los catálogos innecesariamente.
 */
export function usePeriodosExport() {
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPeriodos = async () => {
            try {
                const res = await apiFetch("/api/periodos");
                if (!res.ok) throw new Error("No se pudieron cargar los períodos.");
                const data = await res.json();
                setPeriodos(data);
            } catch (err) {
                console.error("Error al cargar períodos:", err);
                setError("No se pudieron cargar los períodos académicos.");
            } finally {
                setLoading(false);
            }
        };

        fetchPeriodos();
    }, []);

    return { periodos, loading, error };
}
