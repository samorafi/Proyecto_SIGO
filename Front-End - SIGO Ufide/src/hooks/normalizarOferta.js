// /pages/ofertas/functions/normalizarOferta.js

export function normalizarOferta(data, helpers) {
    const {
        matchCursoId,
        matchSedeId,
        matchModalidadId,
        matchHorarioId,
        matchPeriodoId,
        matchCoordinadorId,
        matchAccionIdDesdeEstadoOAccion,
        estadoOferta
    } = helpers;

    let tipoExtraido = "";
    if (typeof data.periodo === "string") {
        const match = data.periodo.match(/[CTP]/i);
        if (match) tipoExtraido = match[0].toUpperCase();
    }

    return {
        cursoId: matchCursoId(data.curso) || data.cursoId || "",
        sedeId: matchSedeId(data.sede) || data.sedeId || "",
        modalidadId: matchModalidadId(data.modalidad) || data.modalidadId || 3,

        horarioId: matchHorarioId(data.horario, data.horarioId),
        periodoId: matchPeriodoId(data.periodo) || data.periodoId || "",

        // AHORA correcto:
        tipoPeriodo: data.tipo || data.tipoPeriodo || tipoExtraido || "",

        coordinadorId: matchCoordinadorId(data.coordinador) || data.coordinadorId || "",
        comentarios: data.comentarios ?? "",
        grupo: data.grupo ?? null,

        accionId:
            typeof data.accionId === "number"
                ? data.accionId
                : matchAccionIdDesdeEstadoOAccion(data.estado, data.accion),

        estadoOfertaId:
            typeof data.estadoOfertaId === "number"
                ? data.estadoOfertaId
                : (
                    estadoOferta.find(e => e.nombre === data.estado)?.estadoOfertaId
                    ?? 2
                ),

        cupo: typeof data.cupo === "number" ? data.cupo : (data.cupo ?? null),
        matriculados:
            typeof data.matriculados === "number"
                ? data.matriculados
                : (data.matriculados ?? null),
    };
}
