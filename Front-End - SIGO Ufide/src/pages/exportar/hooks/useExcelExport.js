import { useState } from "react";
import { alertService } from "@/services/alert.service";
import { exportarOfertasService } from "@/services/exportarOfertas.service";

/**
 * Hook principal que gestiona la lógica de exportación de ofertas a Excel.
 * Soporta dos tipos: 'presencial' (Presencial y En Línea) y 'virtual' (100% Virtual).
 */
export const useExcelExport = () => {
    const [periodoId, setPeriodoId] = useState("");
    const [tipoExport, setTipoExport] = useState("presencial"); // 'presencial' | 'virtual'
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        // Validación: período requerido
        if (!periodoId || Number(periodoId) <= 0) {
            alertService.warning(
                "Período requerido",
                "Por favor selecciona un período académico antes de exportar."
            );
            return;
        }

        try {
            setIsLoading(true);
            alertService.loading(
                "Generando Excel...",
                "Por favor espera mientras se prepara el archivo para descargar."
            );

            const response =
                tipoExport === "presencial"
                    ? await exportarOfertasService.exportPresencial(Number(periodoId))
                    : await exportarOfertasService.export100Virtual(Number(periodoId));

            alertService.close();

            if (!response.ok) {
                let errorMessage = "Ocurrió un error al generar el archivo.";
                try {
                    const errorData = await response.json();
                    if (errorData?.message || errorData?.Message)
                        errorMessage = errorData.message ?? errorData.Message;
                } catch (_) {
                    // Respuesta vacía o no JSON
                }
                alertService.error("Error al exportar", errorMessage);
                return;
            }

            // Obtener el nombre del archivo desde la cabecera Content-Disposition
            const disposition = response.headers.get("content-disposition") ?? "";
            const fileNameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            const fileName =
                fileNameMatch?.[1]?.replace(/['"]/g, "") ??
                `Oferta_${tipoExport === "presencial" ? "Presencial" : "Virtual"}_${periodoId}.xlsx`;

            // Descargar el blob como archivo
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alertService.success(
                "¡Descarga iniciada!",
                `El archivo "${fileName}" se está descargando.`
            );
        } catch (error) {
            alertService.close();
            alertService.apiError(
                error,
                "Error de red",
                "No se pudo conectar con el servidor para la exportación."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        periodoId,
        setPeriodoId,
        tipoExport,
        setTipoExport,
        isLoading,
        handleExport,
    };
};
