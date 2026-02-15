/*
  Archivo: useArchivarOfertas.js

  Descripción: Hook para manejar la lógica de archivado de ofertas, considerando las reglas de cada categoría.

  Reglas de negocio:
  - Histórico (3) no se archiva.
  - Si es Presencial/Virtual (1), el usuario debe elegir si archiva modalidad Presencial (1) o Virtual (2).
  - Si es En Línea (2), la modalidad se fija a En Línea (3) y no se pregunta.
  - El periodo seleccionado se archiva según la modalidad indicada.
  - El procedimiento almacenado garantiza que solo se archiven las ofertas correspondientes a la modalidad y periodo.

  Clases relacionadas:
  - Backend: SIGO.Application.Features.Ofertas.Commands.Archivar;
  - Base de datos: Procedimiento almacenado -  universidad.archivar_ofertas_por_periodo_y_modalidad
  - Frontend: 
            - Componente Modal: modalArchivarOfertas.jsx
            - Componente tabla: OfertasPagedTable.jsx (botón que abre el modal)

*/

import { useMemo, useState, useEffect } from "react"; 

// Importar hooks de periodos para filtrar opciones
import { usePeriodos } from "@/hooks/usePeriodos";

// Importar constantes de categorías/modalidades de ofertas
import {
  isHistorico,
  requiereModalidad,
  modalidadFija,
  OfertaModalidad,
} from "../constants/OfertaCategory";

export const useArchivarOfertas_v2 = (periodos, refresh, category) => {

  // Se definen flags de categoría de las ofertas.
  const catHistorico = isHistorico(category);
  const catRequiereModalidad = requiereModalidad(category);
  const modalidadFixed = modalidadFija(category); // EnLinea => 3, si no => null

  // Estados de modal / formulario
  const [openModal, setOpenModal] = useState(false);

  // Formulario de selección

  // Tipo de periodo a seleccionar
  const [tipoPeriodo, setTipoPeriodo] = useState("");

  useEffect(() => {
    setSelectedPeriodo("");
  }, [tipoPeriodo]);


  // Seleccion del periodo a archivar
  const [selectedPeriodo, setSelectedPeriodo] = useState("");

  // Selección de modalidad (solo si catRequiereModalidad = true)
  const [selectedModalidad, setSelectedModalidad] = useState("");

  // Filtros para los periodos de origen (pasados) y destino (futuros)
  const { periodosPasados: periodosDisponibles } = usePeriodos(periodos, tipoPeriodo);
  const modalidadesParaSelect = useMemo(() => {
    if (!catRequiereModalidad) return [];
    return [
      { id: OfertaModalidad.Presencial, nombre: "Presencial" },
      { id: OfertaModalidad.Virtual, nombre: "Virtual" },
    ];
  }, [catRequiereModalidad]);

  const bloquearModalidad = Boolean(modalidadFixed); // EnLinea => true

  // Estados de la acción de archivar
  const [loadingArchivar, setLoadingArchivar] = useState(false);
  const [mensajeArchivar, setMensajeArchivar] = useState("");

  // Abrir modal en limpio
  const abrirModal = () => {
    if (catHistorico) return;
    setSelectedPeriodo("");
    setMensajeArchivar("");

    // EnLinea: fija a 3; PresencialVirtual: usuario elige
    if (modalidadFixed) setSelectedModalidad(String(modalidadFixed));
    else setSelectedModalidad("");

    setOpenModal(true);
  };

  // Acción principal: Archivar ofertas
  const archivar = async () => {
    try {
      setLoadingArchivar(true);
      setMensajeArchivar("");

      if (!selectedPeriodo) return { ok: false, error: "Seleccione un periodo." };
      if (catHistorico) return { ok: false, error: "Histórico no se archiva." };

      // Si requiere modalidad (1), debe elegir 1 o 2
      if (catRequiereModalidad && !selectedModalidad) {
        return { ok: false, error: "Seleccione Presencial o Virtual." };
      }

      // Modalidad final: fija (3) o seleccionada (1/2)
      const modalidadFinal = modalidadFixed ? modalidadFixed : Number(selectedModalidad);

      // Llamada al Endpoint
      const url = "/api/Ofertas/archivar-por-modalidad";
      const payload = {
        periodoId: Number(selectedPeriodo),
        modalidades: [modalidadFinal],
      };

      const res = await fetch(url, {
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
      await refresh?.();

      return { ok: true, mensaje, result };
    } catch (err) {
      console.error(err);
      return { ok: false, error: "Error al archivar las ofertas." };
    } finally {
      setLoadingArchivar(false);
    }
  };

  const avisoArchivar =
    "Al archivar, las ofertas se moverán a la sección de Histórico. Este proceso no elimina los registros.";

  return {

    // Modal control
    openModal,
    setOpenModal,
    abrirModal,

    // Selección de periodo
    tipoPeriodo,
    setTipoPeriodo,
    selectedPeriodo,
    setSelectedPeriodo,
    periodosDisponibles,

    // Selección de modalidad
    modalidadesParaSelect,
    selectedModalidad,
    setSelectedModalidad,

    // flags de ui
    catHistorico,
    catRequiereModalidad,
    bloquearModalidad,

    // Mensajes de info para el usuario
    avisoArchivar,

    // Acción de archivar
    archivar,

    // Resultados de la acción
    loadingArchivar,
    mensajeArchivar,
  };
};
