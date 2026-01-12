import { useMemo } from "react";

export function useFilteredOfertas({
    ofertas = [],
    term = "",
    filterCurso = "",
    filterSede = "",
    filterEstado = "",
    filterCoordinador = "",
    getHorarioNombre,
    getCursoNombrePorCodigo,
    getCoordinadorNombre,
}) {
    return useMemo(() => {
        const q = String(term ?? "").toLowerCase().trim();

        try {
            return [...ofertas]
                .sort((a, b) => (b?.ofertaId ?? 0) - (a?.ofertaId ?? 0))
                .filter((o) => {
                    const matchCurso = filterCurso ? o.curso === filterCurso : true;
                    const matchSede = filterSede ? o.sede === filterSede : true;
                    const matchEstado = filterEstado ? o.estado === filterEstado : true;
                    const ALL = "__ALL__";
                    const matchCoordinador =
                        filterCoordinador && filterCoordinador !== ALL
                            ? o.coordinadorId === Number(filterCoordinador)
                            : true;

                    const texto = `
            ${o.curso} ${o.sede} ${o.modalidad}
            ${getHorarioNombre?.(o.horarioId) ?? ""}
            ${getCursoNombrePorCodigo?.(o.curso) ?? ""}
            ${o.periodo} ${o.accion}
            ${getCoordinadorNombre?.(o.coordinadorId) ?? ""}
            ${o.estado}
          `.toLowerCase();

                    const termMatch = q ? texto.includes(q) : true;

                    return matchCurso && matchSede && matchEstado && matchCoordinador && termMatch;
                });
        } catch (err) {
            console.error("Error al aplicar filtros:", err);
            return [...ofertas].sort((a, b) => (b?.ofertaId ?? 0) - (a?.ofertaId ?? 0));
        }
    }, [
        ofertas,
        term,
        filterCurso,
        filterSede,
        filterEstado,
        filterCoordinador,
        getHorarioNombre,
        getCursoNombrePorCodigo,
        getCoordinadorNombre,
    ]);
}
