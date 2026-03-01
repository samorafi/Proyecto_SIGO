export const importarOfertasService = {
    /**
     * Envia el archivo Excel al servidor para su importación.
     * @param {File} file Archivo excel a importar.
     * @returns {Promise<Response>} Respuesta pura de fetch
     */
    async uploadExcel(file) {
        const formData = new FormData();
        formData.append("archivo", file);

        // Ajustar el endpoint según configuración de la API actual.
        return fetch("/api/Ofertas/importar", {
            method: "POST",
            body: formData,
            credentials: "include", // Usualmente requerido para manejo de cookies / tokens jwt
        });
    }
};
