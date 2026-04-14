// src/services/alert.service.js
import Swal from "sweetalert2";

// Config base (consistencia visual)
const base = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        popup: "rounded-xl",
        container: "z-[999999]", 
        title: "text-lg font-semibold",
        htmlContainer: "text-sm",
        confirmButton:
            "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition ml-3",
        cancelButton:
            "px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition",
        denyButton:
            "px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition",
    },
});

const toastBase = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: { container: "z-[999999]" },
});

function normalizeErrorMessage(err, fallback = "Ocurrió un error inesperado.") {
    // Casos típicos: axios/fetch/backends
    if (!err) return fallback;

    // Axios: err.response.data puede ser string u objeto
    const data = err?.response?.data;

    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.mensaje === "string") return data.mensaje;

    // Error nativo
    if (typeof err?.message === "string") return err.message;

    return fallback;
}

export const alertService = {
    // Alerts simples
    success(title = "Éxito", text = "") {
        return base.fire({ icon: "success", title, text });
    },
    error(title = "Error", text = "") {
        return base.fire({ icon: "error", title, text });
    },
    info(title = "Info", text = "") {
        return base.fire({ icon: "info", title, text });
    },
    warning(title = "Atención", text = "") {
        return base.fire({ icon: "warning", title, text });
    },

    // Toasts
    toastSuccess(title = "Listo") {
        return toastBase.fire({ icon: "success", title });
    },
    toastError(title = "Algo falló") {
        return toastBase.fire({ icon: "error", title });
    },
    toastInfo(title = "Info") {
        return toastBase.fire({ icon: "info", title });
    },

    // Confirmación (devuelve boolean)
    async confirm({
        title = "¿Estás seguro?",
        text = "Esta acción no se puede deshacer.",
        confirmText = "Sí, continuar",
        cancelText = "Cancelar",
        icon = "warning",
    } = {}) {
        const res = await base.fire({
            icon,
            title,
            text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true,
            focusCancel: true,
        });
        return res.isConfirmed;
    },

    // Loading modal
    loading(title = "Procesando...", text = "Por favor espera") {
        return base.fire({
            title,
            text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
    },
    close() {
        Swal.close();
    },

    // Helper para API errors
    apiError(err, fallbackTitle = "Error", fallbackText = "") {
        const msg = normalizeErrorMessage(err, fallbackText || "No se pudo completar la acción.");
        return base.fire({ icon: "error", title: fallbackTitle, text: msg });
    },
};
