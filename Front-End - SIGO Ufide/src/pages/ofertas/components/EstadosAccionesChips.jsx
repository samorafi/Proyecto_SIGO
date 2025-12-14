// --------------------------------------------------------------
// Chips reutilizables para mostrar acciones y estados de ofertas
// --------------------------------------------------------------

import { Chip } from "@material-tailwind/react";

// Colores para Acciones
export const AccionChips = {
    "Abrir Curso": { color: "green", label: "ABRIR CURSO" },
    "Asignar Profesor": { color: "blue", label: "ASIGNAR PROFESOR" },
    "Nombrado": { color: "teal", label: "NOMBRADO" },
    "Cambiar Profesor": { color: "amber", label: "CAMBIAR PROFESOR" },
    "Cerrar Curso": { color: "red", label: "CERRAR CURSO" },
    "Reserva": { color: "purple", label: "RESERVA" },
    "Suficiencia": { color: "cyan", label: "SUFICIENCIA" },
    "Cerrado": { color: "gray", label: "CERRADO" },
};

// Colores para Estados
export const EstadoChips = {
    Pendiente: { color: "amber", label: "PENDIENTE" },
    Enviada: { color: "blue", label: "ENVIADA" },
    Aceptada: { color: "green", label: "ACEPTADA" },
    Rechazada: { color: "red", label: "RECHAZADA" },
    Cancelada: { color: "gray", label: "CANCELADA" },
    Importado: { color: "teal", label: "IMPORTADO" },
    
};

// --------------------------------------------------------------
// Renderizadores
// --------------------------------------------------------------

export function accionChips(accion) {
    const conf = AccionChips[accion] || {
        color: "blue-gray",
        label: accion || "DESCONOCIDA",
    };

    return (
        <Chip
            value={conf.label}
            color={conf.color}
            className="font-bold text-white rounded-full px-3 py-1 text-xs w-fit"
        />
    );
}

export function estadoChips(estado) {
    const conf = EstadoChips[estado] || {
        color: "blue-gray",
        label: estado || "DESCONOCIDO",
    };

    return (
        <Chip
            value={conf.label}
            color={conf.color}
            className="font-bold text-white rounded-full px-4 py-1 text-xs w-fit min-w-[90px] text-center"
        />
    );
}
