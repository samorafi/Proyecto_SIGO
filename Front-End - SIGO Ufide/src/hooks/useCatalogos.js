import { useEffect, useState } from "react";

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
        ] = await Promise.all([
          fetch("/api/cursos"),
          fetch("/api/sedes"),
          fetch("/api/modalidades"),
          fetch("/api/horarios"),
          fetch("/api/periodos"),
          fetch("/api/personas/coordinadores"),
          fetch("/api/acciones-oferta"),
          fetch("/api/estadoOfertas"),
          fetch("/api/personas"),
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
