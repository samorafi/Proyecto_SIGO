import { useMemo, useState, useEffect } from "react";

export function useEnviarOfertaDocente({
  ofertaSeleccionada,
  docentes = [],
  periodos = [],
  horario = [],
  getNombreHorario,
  getCursoNombrePorCodigo,
  onEnviar,
}) {
  const [openEnviar, setOpenEnviar] = useState(false);
  const [filtroDocente, setFiltroDocente] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [evalPeriodoId, setEvalPeriodoId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [docentesError, setDocentesError] = useState("");

  const abrir = () => setOpenEnviar(true);

  const cerrar = () => {
    setOpenEnviar(false);
    setFiltroDocente("");
    setDocenteId("");
    setEvalPeriodoId("");
    setDocentesError("");
    setEnviando(false);
  };

  useEffect(() => {
    if (!openEnviar) return;

    setFiltroDocente("");
    setDocenteId("");
    setEvalPeriodoId("");
    setDocentesError("");
    setEnviando(false);
  }, [openEnviar, ofertaSeleccionada?.ofertaId]);

  const docentesFiltrados = useMemo(() => {
    const q = (filtroDocente || "").trim().toLowerCase();
    if (!q) return docentes;

    return (docentes || []).filter((d) => {
      const nombre = `${d?.nombre ?? ""} ${d?.apellido1 ?? d?.primerApellido ?? ""} ${d?.apellido2 ?? d?.segundoApellido ?? ""}`.toLowerCase();
      const cedula = String(d?.cedula ?? d?.identificacion ?? "").toLowerCase();
      return nombre.includes(q) || cedula.includes(q);
    });
  }, [docentes, filtroDocente]);

  const getNombreDocente = (id) => {
    const d = (docentes || []).find((x) => String(x?.personaId ?? x?.id) === String(id));
    if (!d) return "Nombre del docente";
    return `${d?.nombre ?? ""} ${d?.apellido1 ?? d?.primerApellido ?? ""} ${d?.apellido2 ?? d?.segundoApellido ?? ""}`.trim() || "Nombre del docente";
  };

  const getPeriodoFormatoOfertaById = (id) => {
    const p = (periodos || []).find((x) => String(x?.periodoId) === String(id));
    if (!p) return "—";
    return `${p.numero}C, ${p.anio}`;
  };

  const previewData = useMemo(() => {
    if (!ofertaSeleccionada) return null;

    const nombreDocente = docenteId ? getNombreDocente(docenteId) : "Nombre del docente";
    const horarioTxt = getNombreHorario?.(ofertaSeleccionada.horarioId) ?? "—";
    const periodoTxt = ofertaSeleccionada.periodo ?? "—";
    const sedeTxt = ofertaSeleccionada.sede ?? "—";
    const modalidadTxt = ofertaSeleccionada.modalidad ?? "—";
    const grupoTxt = ofertaSeleccionada.grupo ?? "—";
    const cupoTxt = ofertaSeleccionada.cupo ?? "N/A";
    const evalPeriodoTxt = evalPeriodoId ? getPeriodoFormatoOfertaById(evalPeriodoId) : "—";

    const gradoTxt = ofertaSeleccionada.grado ?? "Bachillerato";
    const carreraTxt = ofertaSeleccionada.carrera ?? "Sistemas";

    const codigoCursoTxt =
      ofertaSeleccionada.codigoCurso ??
      ofertaSeleccionada.codigo ??
      ofertaSeleccionada.cursoCodigo ??
      ofertaSeleccionada.curso ??
      "—";

    const nombreCursoTxt =
      ofertaSeleccionada.nombreCurso ??
      ofertaSeleccionada.materia ??
      getCursoNombrePorCodigo?.(codigoCursoTxt) ??
      "—";

    const horarioObj = (horario || []).find((h) => String(h.horarioId) === String(ofertaSeleccionada.horarioId));
    const diaTxt = horarioObj?.dia ?? "—";

    const matriculaTxt = ofertaSeleccionada.matricula ?? cupoTxt;
    const accionTxt = "Asignar Profesor";
    const profesorTxt = nombreDocente?.toUpperCase?.() ?? nombreDocente;

    return {
      nombreDocente,
      horarioTxt,
      periodoTxt,
      sedeTxt,
      modalidadTxt,
      grupoTxt,
      cupoTxt,
      evalPeriodoTxt,
      gradoTxt,
      carreraTxt,
      codigoTxt: codigoCursoTxt,
      materiaTxt: nombreCursoTxt,
      diaTxt,
      matriculaTxt,
      accionTxt,
      profesorTxt,
    };
  }, [ofertaSeleccionada, docenteId, evalPeriodoId, horario, getNombreHorario, getCursoNombrePorCodigo, periodos, docentes]);

  const enviar = async () => {
    if (!ofertaSeleccionada) return;

    setDocentesError("");
    if (!docenteId) return setDocentesError("Debe seleccionar un docente.");
    if (!evalPeriodoId) return setDocentesError("Debe seleccionar el periodo de Evaluación Docente.");

    try {
      setEnviando(true);
      await onEnviar?.({ ofertaId: ofertaSeleccionada.ofertaId, docenteId, evalPeriodoId });
      cerrar();
    } finally {
      setEnviando(false);
    }
  };

  return {
    abrir,
    cerrar,
    modalProps: {
      open: openEnviar,
      onClose: cerrar,
      ofertaSeleccionada,
      filtroDocente,
      setFiltroDocente,
      docenteId,
      setDocenteId,
      evalPeriodoId,
      setEvalPeriodoId,
      docentesError,
      enviando,
      docentesFiltrados,
      periodos,
      previewData,
      onEnviar: enviar,
      getNombreDocente,
      getPeriodoFormatoOfertaById,
    },
  };
}
