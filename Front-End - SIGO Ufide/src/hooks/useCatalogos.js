import { useEffect, useState } from "react";
import { apiFetch } from "@/services/apiClientService";

export function useCatalogos() {
  const [catalogos, setCatalogos] = useState({
    cursos: [],
    sedes: [],
    modalidades: [],
    horarios: [],
    periodos: [],
    coordinadores: [],
    estados: [],
    estadoOferta: [],
    personas: [], // Corresponde a personas
    carreras: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          cursosRes,
          sedesRes,
          modalidadesRes,
          horariosRes,
          periodosRes,
          coordinadoresRes,
          estadosRes,
          estadoOfertaRes,
          personasRes,
          carrerasRes,
        ] = await Promise.all([
          apiFetch("/api/cursos"),
          apiFetch("/api/sedes"),
          apiFetch("/api/modalidades"),
          apiFetch("/api/horarios"),
          apiFetch("/api/periodos"),
          apiFetch("/api/personas/coordinadores"),
          apiFetch("/api/acciones-oferta"),
          apiFetch("/api/estadoOfertas"),
          apiFetch("/api/personas"),
          apiFetch("/api/carreras"),
        ]);

        const [
          cursos,
          sedes,
          modalidades,
          horarios,
          periodos,
          coordinadores,
          estados,
          estadoOferta,
          personas,
          carreras,
        ] = await Promise.all([
          cursosRes.json(),
          sedesRes.json(),
          modalidadesRes.json(),
          horariosRes.json(),
          periodosRes.json(),
          coordinadoresRes.json(),
          estadosRes.json(),
          estadoOfertaRes.json(),
          personasRes.json(),
          carrerasRes.json(),
        ]);

        setCatalogos({
          cursos,
          sedes,
          modalidades,
          horarios,
          periodos,
          coordinadores,
          estados,
          estadoOferta,
          personas,
          carreras,
        });
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
        setError("No se pudieron cargar los catálogos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ...catalogos, loading, error };
}
