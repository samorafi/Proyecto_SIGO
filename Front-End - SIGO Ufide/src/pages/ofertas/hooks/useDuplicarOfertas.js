import { useState } from "react";
import { usePeriodos } from "@/hooks/usePeriodos";

export const useDuplicarOfertas = (periodos, fetchOfertas) => {

    const [openDuplicarModal, setOpenDuplicarModal] = useState(false);

    const [tipoPeriodo, setTipoPeriodo] = useState("C");

    const [periodoOrigen, setPeriodoOrigen] = useState("");
    const [periodoDestino, setPeriodoDestino] = useState("");

    const [modalidad, setModalidad] = useState("");

    const [loadingDuplicar, setLoadingDuplicar] = useState(false);
    const [mensajeDuplicar, setMensajeDuplicar] = useState("");


    // -------------------------------------------------------------------
    // Obtiene TODOS los filtros de periodos por tipo
    // -------------------------------------------------------------------
    const {
        periodosPasados: periodosOrigenFiltrados,
        periodosFuturos: periodosDestinoFiltrados,
    } = usePeriodos(periodos, tipoPeriodo);


    // -------------------------------------------------------------------
    // Acción principal: DUPLICAR OFERTAS
    // -------------------------------------------------------------------

    /*
    const duplicarOfertas = async () => {
        try {
            setLoadingDuplicar(true);
            setMensajeDuplicar("");

            // -----------------------------
            // Validaciones
            // -----------------------------
            if (!periodoOrigen) {
                alert("Seleccione un periodo de origen.");
                return;
            }
            if (!periodoDestino) {
                alert("Seleccione un periodo de destino.");
                return;
            }
            if (Number(periodoOrigen) === Number(periodoDestino)) {
                alert("El periodo de origen y destino no pueden ser iguales.");
                return;
            }
            if (!modalidad) {
                alert("Seleccione una modalidad.");
                return;
            }

            const payload = {
                periodoOrigen: Number(periodoOrigen),
                periodoDestino: Number(periodoDestino),
                modalidades: [Number(modalidad)],
            };

            const res = await fetch("/api/Ofertas/duplicar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Error al duplicar las ofertas");

            const result = await res.json();

            alert(result.mensaje || "Duplicación realizada correctamente.");
            setMensajeDuplicar(result.mensaje);

            await fetchOfertas();

            setOpenDuplicarModal(false);

        } catch (err) {
            console.error(err);
            alert("Ocurrió un error al duplicar las ofertas.");
            setMensajeDuplicar("Error al duplicar ofertas.");
        } finally {
            setLoadingDuplicar(false);
        }
    };*/

    const duplicarOfertas = async () => {
        try {
            setLoadingDuplicar(true);
            setMensajeDuplicar("");

            // Validaciones
            if (!periodoOrigen) {
                return { ok: false, error: "Seleccione un periodo de origen." };
            }
            if (!periodoDestino) {
                return { ok: false, error: "Seleccione un periodo de destino." };
            }
            if (Number(periodoOrigen) === Number(periodoDestino)) {
                return { ok: false, error: "El periodo de origen y destino no pueden ser iguales." };
            }
            if (!modalidad) {
                return { ok: false, error: "Seleccione una modalidad." };
            }

            const payload = {
                periodoOrigen: Number(periodoOrigen),
                periodoDestino: Number(periodoDestino),
                modalidades: [Number(modalidad)],
            };

            const res = await fetch("/api/Ofertas/duplicar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const msg = await res.text();
                return { ok: false, error: msg || "Error al duplicar las ofertas." };
            }

            const result = await res.json();
            const mensaje = result?.mensaje || "Duplicación realizada correctamente.";

            setMensajeDuplicar(mensaje);
            await fetchOfertas();

            return { ok: true, mensaje, result };

        } catch (err) {
            console.error(err);
            setMensajeDuplicar("Error al duplicar ofertas.");
            return { ok: false, error: "Ocurrió un error al duplicar las ofertas." };
        } finally {
            setLoadingDuplicar(false);
        }
    };


    // -------------------------------------------------------------------
    // Abrir modal en estado limpio
    // -------------------------------------------------------------------
    const abrirModalDuplicar = () => {
        setMensajeDuplicar("");
        setPeriodoOrigen("");
        setPeriodoDestino("");
        setModalidad("");
        setOpenDuplicarModal(true);
    };


    return {
        openDuplicarModal,
        setOpenDuplicarModal,
        abrirModalDuplicar,

        tipoPeriodo,
        setTipoPeriodo,

        periodoOrigen,
        setPeriodoOrigen,

        periodoDestino,
        setPeriodoDestino,

        modalidad,
        setModalidad,

        periodosOrigenFiltrados,
        periodosDestinoFiltrados,

        loadingDuplicar,
        mensajeDuplicar,

        duplicarOfertas,
    };
};
