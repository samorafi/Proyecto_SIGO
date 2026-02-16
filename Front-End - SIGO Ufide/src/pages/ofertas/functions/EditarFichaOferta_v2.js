/*
  Archivo: EditarFichaOferta_v2.js

  Descripción: Función para actualizar los campos editables de una oferta.

  Reglas de negocio:
    - Solo se pueden actualizar los campos definidos en la ruta /editable del backend.
        {
          "horarioId": 0,
          "accionId": 0,
          "coordinadorId": 0,
          "comentarios": "string",
          "cupo": 0,
          "grupo": 0,
          "matriculados": 0
        }
  
  Clases relacionadas:
    - Backend:
              - SIGO.Application.Features.Ofertas.Commands.Update.UpdateOfertaRequest_v2
              - SIGO.Application.Features.Ofertas.Commands.Update.UpdateOfertaCommandHandler_v2
    - Frontend:
              - Componente Modal: ModalEditarOferta_v2.jsx (donde se editan los campos de la oferta)
              - Componente tabla: OfertasPagedTable.jsx (botón que abre el modal de edición)
*/

export default async function EditarFichaOferta(id, payload) {
  try {

    // Validación: Si no recibe Id se indica que no se encuentra o no es valido
    if (!id) return { ok: false, error: "ID inválido para actualizar la oferta." };

    // Campos obligatorios.
    const required = ["horarioId", "grupo"];
    const missing = required.filter(
      (k) => payload?.[k] === undefined || payload?.[k] === null || payload?.[k] === ""
    );


    if (missing.length) {
      return { ok: false, error: `Ha ocurrido un error: Faltan campos requeridos` };
    }

    // Validación: El grupo no puede ser 0.
    const grupoNum = Number(payload.grupo);
    if (!Number.isFinite(grupoNum) || grupoNum <= 0) {
      return { ok: false, error: "El grupo es requerido y debe ser mayor a 0." };
    }

    // Normalizar a número por si viene string desde el input
    const cleanPayload = {
      horarioId: Number(payload.horarioId),
      accionId: payload.accionId === "" ? null : (payload.accionId != null ? Number(payload.accionId) : null),
      coordinadorId: payload.coordinadorId === "" ? null : (payload.coordinadorId != null ? Number(payload.coordinadorId) : null),
      comentarios: payload.comentarios ?? "",
      cupo: payload.cupo === "" ? null : (payload.cupo != null ? Number(payload.cupo) : null),
      grupo: grupoNum,
      matriculados: payload.matriculados === "" ? null : (payload.matriculados != null ? Number(payload.matriculados) : null),
    };

    // Llamada al endpoint
    const res = await fetch(`/api/Ofertas/${id}/editable`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanPayload),
    });

    // Manejo de errores y extracción del JSON del backend
    if (!res.ok) {
      let backendMsg = "";
      try {
        const errData = await res.json();
        backendMsg =
          errData?.message ||
          errData?.title ||
          errData?.error ||
          (errData?.errors ? Object.values(errData.errors).flat().join(" | ") : "");
      } catch (_) {}

      return {
        ok: false,
        error:
          backendMsg ||
          "No se pudo actualizar la oferta. Verifique los datos e inténtelo de nuevo.",
      };
    }

    // Normal: 204 No Content
    return { ok: true, data: null };
  } catch (error) {
    console.error("Error en EditarFichaOferta:", error);
    return { ok: false, error: "Error inesperado al actualizar la oferta." };
  }
}
