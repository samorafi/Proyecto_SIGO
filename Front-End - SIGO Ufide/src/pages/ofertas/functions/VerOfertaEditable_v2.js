/*
  Archivo: VerOfertaEditable_v2.js

  Descripción: Función para obtener los datos de una oferta específica para su edición.

  Clases relacionadas:
  - Backend: 
            - SIGO.Application.Features.Ofertas.Queries.GetOfertaByIdQueryHandler_v2;
            - SIGO.Application.Features.Ofertas.Queries.GetOfertaByIdQuery_v2;
  - Frontend:
            - Componente Modal: ModalEditarOferta_v2.jsx (usa esta función para cargar datos al abrir el modal)
*/

export default async function VerOfertaEditable(id) {
  try {

    // Llamada al endpoint
    const res = await fetch(`/api/ofertas/${id}/ficha`);
    if (!res.ok) {
      return { ok: false, error: "No se pudo cargar la oferta para edición." };
    }

    // Almancenar JSON 
    const data = await res.json();
    return { ok: true, data };

    // Manejo de errores
  } catch (e) {
    console.error("Error en VerOfertaEditable:", e);
    return { ok: false, error: "Error inesperado al cargar la oferta." };
  }
}
