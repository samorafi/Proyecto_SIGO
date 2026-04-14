import { apiFetch } from "@/services/apiClientService";

export const exportarOfertasService = {
    /**
     * Descarga el Excel de ofertas Presencial / En Línea filtrado por período.
     * @param {number} periodoId ID del período académico.
     * @returns {Promise<Response>} Respuesta pura de apiFetch (blob).
     */
    async exportPresencial(periodoId) {
        return apiFetch(
            `/api/Ofertas/export/presencial-en_linea?periodoId=${periodoId}`,
            { method: "GET", credentials: "include" }
        );
    },

    /**
     * Descarga el Excel de ofertas 100% Virtual filtrado por período.
     * @param {number} periodoId ID del período académico.
     * @returns {Promise<Response>} Respuesta pura de apiFetch (blob).
     */
    async export100Virtual(periodoId) {
        return apiFetch(
            `/api/Ofertas/export/100%-virtual?periodoId=${periodoId}`,
            { method: "GET", credentials: "include" }
        );
    },
};
