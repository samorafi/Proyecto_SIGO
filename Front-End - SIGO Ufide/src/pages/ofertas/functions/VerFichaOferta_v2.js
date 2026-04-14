/*
    Archivo: VerFichaOferta_v2.js

    Descripción: Función para obtener la ficha de una oferta específica.

    Reglas de negocio:
    - Realiza una solicitud a la API para obtener los detalles de la oferta.
    - Maneja errores de red y respuestas no exitosas.
    - Devuelve un objeto con el estado de la operación y los datos o el error correspondiente.


    Clases relacionadas:
    - Backend: 
                SIGO.Application.Features.Ofertas.Queries.GetOfertaByIdQueryHandler_v2;
                SIGO.Application.Features.Ofertas.Queries.GetOfertaByIdQuery_v2;
    - Frontend:
                - Componente Modal: ModalVerOferta,jsx (donde se muestra la ficha de la oferta)
                - Componente tabla: OfertasPagedTable.jsx (botón que abre el modal con la ficha)


*/
import { apiFetch } from "@/services/apiClientService";

export default async function VerFichaOferta(id) {
    try {

        // Llamada al endpoint
        const res = await apiFetch(`/api/ofertas/${id}/ficha`);
        if (!res.ok) {
            return { ok: false, error: "No se pudo cargar la ficha de la oferta." };
        }

        // Parsear la respuesta JSON
        const data = await res.json();

        return { ok: true, data };
    } catch (error) {
        console.error("Error en VerFichaOferta:", error);
        return { ok: false, error: "Error inesperado al cargar la ficha." };
    }
}
