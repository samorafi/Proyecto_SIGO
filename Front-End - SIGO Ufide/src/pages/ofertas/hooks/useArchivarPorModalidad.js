import { useState } from "react";
import { usePeriodos } from "@/hooks/usePeriodos";
import { apiFetch } from "@/services/apiClientService";

export const useArchivarPorModalidad = (periodos, fetchOfertas) => {

    // -------------------------------------------------------------------------
    // Estados del modal
    // -------------------------------------------------------------------------
    const [openModal, setOpenModal] = useState(false);

    const [tipoPeriodo, setTipoPeriodo] = useState("C");

    const [selectedPeriodo, setSelectedPeriodo] = useState("");
    const [selectedModalidad, setSelectedModalidad] = useState("");

    const [loadingArchivar, setLoadingArchivar] = useState(false);
    const [mensajeArchivar, setMensajeArchivar] = useState("");


    // -------------------------------------------------------------------------
    // Periodos pasados (no futuros)
    // -------------------------------------------------------------------------
    const { periodosPasados: periodosDisponibles } =
        usePeriodos(periodos, tipoPeriodo);

    // -------------------------------------------------------------------------
    // Acción principal: Archivar por modalidad
    // -------------------------------------------------------------------------

    const archivarPorModalidad = async () => {
        try {
            setLoadingArchivar(true);
            setMensajeArchivar("");

            if (!selectedPeriodo) {
                return { ok: false, error: "Seleccione un periodo." };
            }

            if (!selectedModalidad) {
                return { ok: false, error: "Seleccione una modalidad." };
            }

            const payload = {
                periodoId: Number(selectedPeriodo),
                modalidades: [Number(selectedModalidad)],
            };

            const res = await apiFetch("/api/Ofertas/archivar-por-modalidad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const msg = await res.text();
                return { ok: false, error: msg || "Error en la operación de archivado." };
            }

            const result = await res.json();
            const mensaje = result?.mensaje || "Operación completada.";

            setMensajeArchivar(mensaje);

            await fetchOfertas();

            // setOpenModal(false);

            return { ok: true, mensaje, result };
        } catch (err) {
            console.error(err);
            setMensajeArchivar("Ocurrió un error al archivar.");
            return { ok: false, error: "Error al archivar las ofertas." };
        } finally {
            setLoadingArchivar(false);
        }
    };


    // -------------------------------------------------------------------------
    // Abrir modal limpio
    // -------------------------------------------------------------------------
    const abrirModal = () => {
        setSelectedPeriodo("");
        setSelectedModalidad("");
        setMensajeArchivar("");
        setOpenModal(true);
    };


    return {
        // Modal
        openModal,
        setOpenModal,
        abrirModal,

        // Tipo de periodo
        tipoPeriodo,
        setTipoPeriodo,

        // Periodo
        selectedPeriodo,
        setSelectedPeriodo,

        // Modalidad
        selectedModalidad,
        setSelectedModalidad,

        // Lista filtrada lista para el Select
        periodosDisponibles,

        // Acción
        archivarPorModalidad,

        // Estados
        loadingArchivar,
        mensajeArchivar,
    };
};
