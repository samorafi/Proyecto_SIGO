import { useState } from "react";
import { usePeriodos } from "@/hooks/usePeriodos";

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
                alert("Seleccione un periodo.");
                return;
            }

            if (!selectedModalidad) {
                alert("Seleccione una modalidad.");
                return;
            }

            const payload = {
                periodoId: Number(selectedPeriodo),
                modalidades: [Number(selectedModalidad)],
            };

            const res = await fetch("/api/Ofertas/archivar-por-modalidad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Error en la operación de archivado.");
            }

            const result = await res.json();
            setMensajeArchivar(result.mensaje || "Operación completada.");

            alert(result.mensaje || "Archivado realizado correctamente.");

            await fetchOfertas();

            setOpenModal(false);

        } catch (err) {
            console.error(err);
            alert("Error al archivar las ofertas.");
            setMensajeArchivar("Ocurrió un error al archivar.");
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
