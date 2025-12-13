// /pages/ofertas/functions/CancelarOferta.js

export async function CancelarOferta(oferta, helpers) {
    const {
        matchCursoId,
        matchSedeId,
        matchModalidadId,
        matchHorarioId,
        matchPeriodoId,
        matchCoordinadorId,
        matchAccionIdDesdeEstadoOAccion,
    } = helpers;

    try {
        if (!oferta) {
            return { ok: false, error: "No se encontró la oferta." };
        }

        // Si ya está cancelada, no hacer nada
        if (oferta.estadoOfertaId === 5 || oferta.estado === "Cancelada") {
            return {
                ok: false,
                error: "Esta oferta ya se encuentra cancelada.",
            };
        }

        // --------------------------
        // Payload normalizado
        // --------------------------
        const payload = {
            cursoId: matchCursoId(oferta.curso) || oferta.cursoId,
            sedeId: matchSedeId(oferta.sede) || oferta.sedeId,
            modalidadId: matchModalidadId(oferta.modalidad) || oferta.modalidadId,
            horarioId: matchHorarioId(oferta.horario, oferta.horarioId),
            periodoId: matchPeriodoId(oferta.periodo) || oferta.periodoId,
            accionId:
                matchAccionIdDesdeEstadoOAccion(oferta.estado, oferta.accion) ||
                oferta.accionId,
            coordinadorId:
                typeof oferta.coordinador === "object"
                    ? oferta.coordinador?.id ?? oferta.coordinadorId
                    : matchCoordinadorId(oferta.coordinador) || oferta.coordinadorId,

            comentarios: oferta.comentarios ?? "",
            estadoOfertaId: 5,
        };

        // --------------------------
        // PUT al backend
        // --------------------------
        const response = await fetch(`/api/ofertas/${oferta.ofertaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const msg = await response.text();
            console.error("Error backend:", msg);
            return { ok: false, error: "No fue posible cancelar la oferta." };
        }

        const updated = {
            ...oferta,
            estado: "Cancelada",
            estadoOfertaId: 5,
        };

        return { ok: true, updatedOferta: updated };

    } catch (e) {
        return { ok: false, error: "Error desconocido al cancelar la oferta." };
    }
}
