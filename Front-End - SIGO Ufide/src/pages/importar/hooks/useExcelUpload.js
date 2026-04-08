import { useState, useRef, useEffect } from "react";
import { alertService } from "@/services/alert.service";
import { importarOfertasService } from "@/services/importarOfertas.service";

export const useExcelUpload = () => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    // Previene que el navegador abra el archivo si el usuario lo suelta
    // fuera de la zona de drop (evita el page reload / "archivo corrompido").
    useEffect(() => {
        const preventBrowserOpen = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "none";
        };
        document.addEventListener("dragover", preventBrowserOpen);
        document.addEventListener("drop", preventBrowserOpen);
        return () => {
            document.removeEventListener("dragover", preventBrowserOpen);
            document.removeEventListener("drop", preventBrowserOpen);
        };
    }, []);


    // Drag Handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    // Validation
    const validateAndSetFile = (selectedFile) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
        ];

        if (
            !validTypes.includes(selectedFile.type) &&
            !selectedFile.name.endsWith(".xlsx") &&
            !selectedFile.name.endsWith(".xls")
        ) {
            alertService.warning(
                "Formato no válido",
                "Por favor, carga un archivo Excel (.xlsx o .xls)."
            );
            return;
        }

        setFile(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Upload Logic
    const handleUpload = async () => {
        if (!file) {
            alertService.warning(
                "Archivo requerido",
                "Por favor selecciona un archivo Excel primero."
            );
            return;
        }

        try {
            alertService.loading(
                "Importando datos...",
                "Por favor espera mientras se procesa el archivo. Esto puede tardar unos minutos."
            );

            const response = await importarOfertasService.uploadExcel(file);
            alertService.close();

            if (response.ok) {
                alertService.success("¡Éxito!", "Se han cargado los datos correctamente.");
                removeFile();
            } else {
                let errorMessage = "Ocurrió un error al procesar el archivo.";
                try {
                    const errorData = await response.json();
                    if (errorData.message || errorData.Message) errorMessage = errorData.message ?? errorData.Message;
                    const errList = errorData.errores ?? errorData.Errores;
                    if (errList && Array.isArray(errList)) {
                        errorMessage = errList.join("<br/>");
                    }
                } catch (e) {
                    // Response body empty or not json.
                }
                alertService.error("Ups, los datos son inválidos", errorMessage);
            }
        } catch (error) {
            alertService.close();
            alertService.apiError(
                error,
                "Error de red",
                "No se pudo conectar con el servidor para la importación."
            );
        }
    };

    return {
        isDragActive,
        file,
        fileInputRef,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileChange,
        removeFile,
        handleUpload,
    };
};
