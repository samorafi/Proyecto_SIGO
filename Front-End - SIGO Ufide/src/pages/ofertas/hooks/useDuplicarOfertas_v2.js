/* 
    Archivo: useDuplicarOfertas_v2.js

    Descripción: Hook para manejar la lógica de duplicar ofertas entre periodos, considerando las reglas de cada categoría.

    Reglas de negocio:
    - Solo aplica para categorías PresencialVirtual (1) y EnLinea (2). Histórico (3) no duplica.
    - Si es PresencialVirtual, el usuario debe elegir si duplica modalidad Presencial (1) o Virtual (2).
    - Si es EnLinea, la modalidad se fija a EnLinea (3) y no se pregunta.
    - El periodo de origen y destino no pueden ser iguales.
    - Las ofertas en estado Cancelado (ID 5) no se duplican (Procedimiento almacenado lo garantiza, pero se informa al usuario).

    Clases relacionadas:
    - Backend: SIGO.Application.Features.Ofertas.Commands.Duplicar;
    - Base de datos: Procedimiento almacenado - universidad.duplicar_ofertas_por_periodo
    - Frontend: 
                - Componente Modal: modalDuplicarOfertas.jsx
                - Componente tabla: OfertasPagedTable.jsx (botón que abre el modal)

*/

import { useEffect, useMemo, useState } from "react";

// Importar hooks de periodos para filtrar opciones
import { usePeriodos } from "@/hooks/usePeriodos";

// Importar constantes de categorías/modalidades de ofertas
import {
    isHistorico,
    requiereModalidad,
    modalidadFija,
    modalidadesPermitidasPorCategoria,
} from "../constants/OfertaCategory";

export const useDuplicarOfertas_v2 = (periodos, fetchOfertas, category) => {

    // Se definen flags de categoría de las ofertas.
    const catHistorico = isHistorico(category);
    const catRequiereModalidad = requiereModalidad(category);
    const modalidadFixed = modalidadFija(category); // 3 si EnLinea, null si PresencialVirtual/Historico

    // Estados de modal / formulario
    const [openModal, setOpenModal] = useState(false);
    const [tipoPeriodo, setTipoPeriodo] = useState("C");

    // Formulario de selección
    const [periodoOrigen, setPeriodoOrigen] = useState("");
    const [periodoDestino, setPeriodoDestino] = useState("");

    // Solo aplica cuando catRequiereModalidad = true (cat = 1).
    // Para en el caso de EnLinea se setea fijo a 3.
    const [selectedModalidad, setSelectedModalidad] = useState("");

    // Estados de la acción de duplicar
    const [loadingDuplicar, setLoadingDuplicar] = useState(false);
    const [mensajeDuplicar, setMensajeDuplicar] = useState("");

    // Periodos filtrados para la selección de origen y destino
    const { periodosPasados: periodosOrigenFiltrados = [] } = usePeriodos(periodos, tipoPeriodo);
    const { periodosFuturos: periodosDestinoFiltrados = [] } = usePeriodos(periodos, tipoPeriodo);

    // Modalidades permitidas (para filtrar dropdown del modal)
    const modalidadesPermitidas = useMemo(() => {
        return modalidadesPermitidasPorCategoria(category); // [1,2] o [3] o []
    }, [category]);

    const bloquearModalidad = Boolean(modalidadFixed); // EnLinea => true

    // Si es EnLinea (modalidadFixed = 3), autoseleccionar modalidad cuando se abre
    useEffect(() => {
        if (!openModal) return;

        if (modalidadFixed) {
            setSelectedModalidad(String(modalidadFixed)); // "3"
        } else {
            // En PresencialVirtual dejamos que el usuario elija 1 o 2
            setSelectedModalidad("");
        }
    }, [openModal, modalidadFixed]);

    useEffect(() => {
        if (!openModal) return;
        setPeriodoOrigen("");
        setPeriodoDestino("");
    }, [tipoPeriodo, openModal]);

    // Abrir modal en limpio
    const abrirModalDuplicar = () => {
        if (catHistorico) return; // histórico no duplica

        setMensajeDuplicar("");
        setPeriodoOrigen("");
        setPeriodoDestino("");

        // set modalidad: fija o vacía
        if (modalidadFixed) setSelectedModalidad(String(modalidadFixed));
        else setSelectedModalidad("");

        setOpenModal(true);
    };

    // Acción principal: Duplicar
    const duplicar = async () => {
        try {
            setLoadingDuplicar(true);
            setMensajeDuplicar("");

            if (!periodoOrigen) return { ok: false, error: "Seleccione un periodo de origen." };
            if (!periodoDestino) return { ok: false, error: "Seleccione un periodo de destino." };

            if (Number(periodoOrigen) === Number(periodoDestino)) {
                return { ok: false, error: "El periodo origen y destino no pueden ser iguales." };
            }

            // Si la categoría requiere modalidad (Presencial/Virtual), debe elegir 1 o 2
            if (catRequiereModalidad && !selectedModalidad) {
                return { ok: false, error: "Seleccione Presencial o Virtual." };
            }

            // Modalidad final: fija (3) o la seleccionada
            const modalidadFinal = modalidadFixed ? modalidadFixed : Number(selectedModalidad);

            const payload = {
                periodoOrigen: Number(periodoOrigen),
                periodoDestino: Number(periodoDestino),
                modalidades: [modalidadFinal],
            };

            // Llamada al Endpoint
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
            const mensaje =
                result?.mensaje ||
                result?.message ||
                "Duplicación completada. (Nota: ofertas Canceladas no se duplican).";

            setMensajeDuplicar(mensaje);

            await fetchOfertas?.();

            return { ok: true, mensaje, result };
        } catch (err) {
            console.error(err);
            return { ok: false, error: "Ocurrió un error al duplicar las ofertas." };
        } finally {
            setLoadingDuplicar(false);
        }
    };

    // Info para UI
    const avisoCanceladas =
        `Importarte: Las ofertas en estado Cancelado no se duplicarán.`;

    return {

        // Modal control
        openModal,
        setOpenModal,
        abrirModalDuplicar,

        // Selección de periodo
        tipoPeriodo,
        setTipoPeriodo,
        periodoOrigen,
        setPeriodoOrigen,
        periodoDestino,
        setPeriodoDestino,
        periodosOrigenFiltrados,
        periodosDestinoFiltrados,

        // Selección de modalidad
        selectedModalidad,
        setSelectedModalidad,

        // flags de UI
        catHistorico,
        catRequiereModalidad,
        modalidadesPermitidas,
        bloquearModalidad,

        // Mensajes de info para el usuario
        avisoCanceladas,

        // Acción de duplica
        duplicar,

        // Resultados de la acción
        loadingDuplicar,
        mensajeDuplicar,
    };
};
