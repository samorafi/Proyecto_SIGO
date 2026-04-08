import { apiFetch } from "@/services/apiClientService";

export const importarOfertasService = {
    /**
     * Envia el archivo Excel al servidor para su importación.
     * @param {File} file Archivo excel a importar.
     * @returns {Promise<Response>} Respuesta pura de apiFetch
     */
    async uploadExcel(file) {
        const formData = new FormData();
        formData.append("ArchivoExcel", file);
        formData.append("PeriodoId", "1"); // Valor dummy para satisfacer el Command del backend

        // Ajustar el endpoint según configuración de la API actual.
        return apiFetch("/api/Ofertas/importar-presencial", {
            method: "POST",
            body: formData,
            credentials: "include", // Usualmente requerido para manejo de cookies / tokens jwt
        });
    }
};
