import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    Select,
    Option,
    Input,
    Button,
    Typography,
    Textarea,
} from "@material-tailwind/react";

import AppModal from "@/components/ui/Modals/AppModal";
import EditarFichaOferta from "@/pages/ofertas/functions/EditarFichaOferta_v2";
import { alertService } from "@/services/alert.service";
import VerOfertaEditar from "../functions/VerFichaOferta_v2";
import { entityConfirm } from "@/services/entityConfirm.service";
import AgregarAsistenteOferta from "@/pages/ofertas/functions/AgregarAsistenteOferta";
import QuitarAsistenteOferta from "@/pages/ofertas/functions/QuitarAsistenteOferta";
import EnviarOfertaAsistente from "@/pages/ofertas/functions/EnviarOfertaAsistente";

const emptyForm = {
    accionId: "",
    horarioId: "",
    coordinadorId: "",
    cupo: "",
    matriculados: "",
    grupo: "",
    comentarios: "",
};

export default function ModalEditarOferta_v2({
    open,
    onClose,
    ofertaId,
    onSuccess,
    horarios = [],
    acciones = [],
    coordinadores = [],
    docentes = [],
    periodos = [],
}) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [selectedAsistenteId, setSelectedAsistenteId] = useState("");
    const [savingAsistente, setSavingAsistente] = useState(false);
    const [filtroDocenteAsistente, setFiltroDocenteAsistente] = useState("");
    const [evalPeriodoAsistenteId, setEvalPeriodoAsistenteId] = useState("");

    const [tipoPeriodoAsistente, setTipoPeriodoAsistente] = useState("");

    // Evita que los modales de confirmación/alerta cierren el modal padre.
    const blockParentCloseRef = useRef(false);

    const closeModal = useCallback(() => {
        blockParentCloseRef.current = false;
        onClose?.();
    }, [onClose]);

    const handleModalClose = useCallback(() => {
        if (blockParentCloseRef.current) return;
        onClose?.();
    }, [onClose]);

    const releaseParentClose = useCallback(() => {
        setTimeout(() => {
            blockParentCloseRef.current = false;
        }, 0);
    }, []);

    useEffect(() => {
        if (!open) {
            setLoading(false);
            setSaving(false);
            setOriginalData(null);
            setForm(emptyForm);
            setSelectedAsistenteId("");
            setSavingAsistente(false);
            setFiltroDocenteAsistente("");
            setTipoPeriodoAsistente("");
            setEvalPeriodoAsistenteId("");
        }
    }, [open]);

    const cargarOferta = useCallback(async () => {
        if (!ofertaId) return;

        const res = await VerOfertaEditar(ofertaId);

        if (res.ok) {
            const d = res.data;
            setOriginalData(d);

            setForm({
                accionId: d.accionId ? String(d.accionId) : "",
                horarioId: d.horarioId ? String(d.horarioId) : "",
                coordinadorId: d.coordinadorId ? String(d.coordinadorId) : "",
                cupo: d.cupo ?? "",
                matriculados: d.matriculados ?? "",
                grupo: d.grupo ?? "",
                comentarios: d.comentarios ?? "",
            });
        } else {
            throw new Error(res.error || "No se pudo obtener la información.");
        }
    }, [ofertaId]);

    useEffect(() => {
        if (!open || !ofertaId) return;

        let cancelled = false;

        const run = async () => {
            try {
                setLoading(true);
                await cargarOferta();
            } catch (e) {
                if (!cancelled) {
                    alertService.error("Error", e.message || "Falló la carga de la oferta.");
                    onClose?.();
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [open, ofertaId, onClose, cargarOferta]);

    const hasChanges = useMemo(() => {
        if (!originalData) return false;

        const base = {
            accionId: originalData.accionId ? String(originalData.accionId) : "",
            horarioId: originalData.horarioId ? String(originalData.horarioId) : "",
            coordinadorId: originalData.coordinadorId ? String(originalData.coordinadorId) : "",
            cupo: originalData.cupo ?? "",
            matriculados: originalData.matriculados ?? "",
            grupo: originalData.grupo ?? "",
            comentarios: originalData.comentarios ?? "",
        };

        return (
            String(form.accionId ?? "") !== String(base.accionId ?? "") ||
            String(form.horarioId ?? "") !== String(base.horarioId ?? "") ||
            String(form.coordinadorId ?? "") !== String(base.coordinadorId ?? "") ||
            String(form.cupo ?? "") !== String(base.cupo ?? "") ||
            String(form.matriculados ?? "") !== String(base.matriculados ?? "") ||
            String(form.grupo ?? "") !== String(base.grupo ?? "") ||
            String(form.comentarios ?? "") !== String(base.comentarios ?? "")
        );
    }, [form, originalData]);

    const isCancelada =
        String(originalData?.estadoOfertaId) === "5" ||
        String(originalData?.estado ?? "").toLowerCase().trim() === "cancelada";

    const modalidadTexto = String(originalData?.modalidad ?? "")
        .trim()
        .toLowerCase();

    const esOfertaVirtual100 =
        modalidadTexto === "en linea" ||
        modalidadTexto === "en línea";

    const disabledFields = loading || saving || isCancelada;

    const asistentes = useMemo(() => originalData?.asistentes ?? [], [originalData]);

    const asistentesIds = useMemo(
        () => new Set(asistentes.map((a) => Number(a.personaId))),
        [asistentes]
    );

    const docentePrincipalId = useMemo(() => {
        return Number(
            originalData?.personaId ??
            originalData?.docenteId ??
            originalData?.profesorId ??
            0
        );
    }, [originalData]);

    const docentesDisponiblesComoAsistentes = useMemo(() => {
        return (docentes || []).filter((d) => {
            const id = Number(d?.personaId ?? d?.id);
            if (!id) return false;
            if (asistentesIds.has(id)) return false;
            if (docentePrincipalId && id === docentePrincipalId) return false;
            return true;
        });
    }, [docentes, asistentesIds, docentePrincipalId]);

    const docentesFiltradosAsistentes = useMemo(() => {
        const q = String(filtroDocenteAsistente || "").trim().toLowerCase();
        if (!q) return docentesDisponiblesComoAsistentes;

        return docentesDisponiblesComoAsistentes.filter((d) => {
            const nombre = String(d?.nombre ?? "").toLowerCase();
            const apellido1 = String(d?.apellido1 ?? d?.primerApellido ?? "").toLowerCase();
            const apellido2 = String(d?.apellido2 ?? d?.segundoApellido ?? "").toLowerCase();
            const cedula = String(d?.cedula ?? d?.identificacion ?? "").toLowerCase();

            const texto = `${nombre} ${apellido1} ${apellido2} ${cedula}`.trim();
            return texto.includes(q);
        });
    }, [docentesDisponiblesComoAsistentes, filtroDocenteAsistente]);

    const periodosOrdenadosAsistente = useMemo(() => {
        const lista = (periodos || []).filter((p) => {
            if (!tipoPeriodoAsistente) return false;
            return String(p?.tipo ?? "").toUpperCase() === String(tipoPeriodoAsistente).toUpperCase();
        });

        return lista.sort((a, b) => {
            const anioA = Number(a?.anio ?? 0);
            const anioB = Number(b?.anio ?? 0);

            if (anioB !== anioA) return anioB - anioA;

            const numA = Number(a?.numero ?? 0);
            const numB = Number(b?.numero ?? 0);

            return numB - numA;
        });
    }, [periodos, tipoPeriodoAsistente]);

    const menuPropsSafe = {
        className:
            "z-[99999] max-h-64 overflow-auto bg-white border border-blue-gray-100 rounded-md shadow-xl",
    };

    useEffect(() => {
        if (!esOfertaVirtual100) {
            setSelectedAsistenteId("");
            setFiltroDocenteAsistente("");
            setTipoPeriodoAsistente("");
            setEvalPeriodoAsistenteId("");
        }
    }, [esOfertaVirtual100]);

    const validate = () => {
        const cupo = form.cupo === "" ? null : Number(form.cupo);
        const matric = form.matriculados === "" ? null : Number(form.matriculados);

        const grupo = Number(form.grupo);
        if (!Number.isFinite(grupo) || grupo <= 0) {
            return "Grupo es requerido y debe ser mayor a 0.";
        }

        if (cupo != null && (Number.isNaN(cupo) || cupo < 0)) {
            return "El cupo debe ser un número válido mayor o igual a 0.";
        }
        if (matric != null && (Number.isNaN(matric) || matric < 0)) {
            return "Matriculados debe ser un número válido mayor o igual a 0.";
        }
        if (cupo != null && matric != null && matric > cupo) {
            return "Matriculados no puede ser mayor que el cupo.";
        }
        return null;
    };

    const handleGuardar = async () => {
        if (!ofertaId) return;

        const err = validate();
        if (err) {
            alertService.error("Validación", err);
            return;
        }

        const ok = await entityConfirm.update("la oferta");
        if (!ok) return;

        try {
            setSaving(true);

            alertService.loading("Actualizando...", "Aplicando cambios");

            const payload = {
                horarioId: Number(form.horarioId),
                accionId: form.accionId === "" ? null : Number(form.accionId),
                coordinadorId: form.coordinadorId === "" ? null : Number(form.coordinadorId),
                comentarios: form.comentarios ?? "",
                cupo: form.cupo === "" ? null : Number(form.cupo),
                grupo: Number(form.grupo),
                matriculados: form.matriculados === "" ? null : Number(form.matriculados),
            };

            const res = await EditarFichaOferta(ofertaId, payload);

            alertService.close();

            if (res.ok) {
                alertService.toastSuccess("Oferta actualizada correctamente");
                onSuccess?.();
                closeModal();
            } else {
                alertService.error("Error", res.error || "No se pudo actualizar la oferta.");
            }
        } catch (e) {
            alertService.close();
            alertService.error("Error", "Falló la actualización.");
        } finally {
            setSaving(false);
        }
    };

    const handleAgregarAsistente = async () => {
        if (!ofertaId) return;

        if (!selectedAsistenteId) {
            alertService.warning("Atención", "Seleccione un asistente.");
            return;
        }

        const yaExiste = asistentes.some(
            (a) => Number(a.personaId) === Number(selectedAsistenteId)
        );

        if (yaExiste) {
            alertService.warning("Atención", "Ese docente ya está asignado como asistente.");
            return;
        }

        try {
            setSavingAsistente(true);
            alertService.loading("Agregando asistente...", "Por favor espera");

            const res = await AgregarAsistenteOferta(ofertaId, selectedAsistenteId);

            alertService.close();

            if (!res.ok) {
                alertService.error("Error", res.error || "No se pudo agregar el asistente.");
                return;
            }

            await cargarOferta();
            setSelectedAsistenteId("");
            setFiltroDocenteAsistente("");
            alertService.toastSuccess("Asistente agregado correctamente");
        } catch (e) {
            alertService.close();
            alertService.error("Error", "Falló la asignación del asistente.");
        } finally {
            setSavingAsistente(false);
        }
    };

    const handleEnviarOfertaAsistente = async (asistente) => {
        if (!ofertaId || !asistente?.personaId) return;

        blockParentCloseRef.current = true;

        const nombre =
            asistente?.nombreCompleto ||
            [asistente?.nombre, asistente?.primerApellido, asistente?.segundoApellido]
                .filter(Boolean)
                .join(" ") ||
            "este asistente";

        const esReenvio = asistente?.estadoSolicitudTexto === "Pendiente";

        const ok = await alertService.confirm({
            title: esReenvio ? "¿Reenviar oferta al asistente?" : "¿Enviar oferta al asistente?",
            text: esReenvio
                ? `Se reenviará la oferta a ${nombre}.`
                : `Se enviará la oferta a ${nombre}.`,
            confirmText: esReenvio ? "Sí, reenviar" : "Sí, enviar",
            cancelText: "Cancelar",
        });

        if (!ok) {
            releaseParentClose();
            return;
        }

        try {
            setSavingAsistente(true);
            alertService.loading("Enviando oferta...", "Por favor espera");

            const payload = {
                ofertaId: Number(ofertaId),
                personaId: Number(asistente.personaId),
                evaluacionPeriodoId: evalPeriodoAsistenteId
                    ? Number(evalPeriodoAsistenteId)
                    : null,
            };

            const res = await EnviarOfertaAsistente(payload);

            alertService.close();

            if (!res.ok) {
                alertService.error("Error", res.error || "No se pudo enviar la oferta al asistente.");
                return;
            }

            await cargarOferta();
            alertService.toastSuccess("Oferta enviada al asistente correctamente");
        } catch (e) {
            alertService.close();
            alertService.error("Error", "Falló el envío de la oferta al asistente.");
        } finally {
            setSavingAsistente(false);
            releaseParentClose();
        }
    };

    const handleQuitarAsistente = async (personaId, nombre) => {
        const ok = await alertService.confirm({
            title: "¿Quitar asistente?",
            text: `Se quitará a ${nombre || "este asistente"} de la oferta.`,
            confirmText: "Sí, quitar",
            cancelText: "Cancelar",
        });

        if (!ok) return;

        try {
            setSavingAsistente(true);
            alertService.loading("Quitando asistente...", "Por favor espera");

            const res = await QuitarAsistenteOferta(ofertaId, personaId);

            alertService.close();

            if (!res.ok) {
                alertService.error("Error", res.error || "No se pudo quitar el asistente.");
                return;
            }

            await cargarOferta();
            alertService.toastSuccess("Asistente quitado correctamente");
        } catch (e) {
            alertService.close();
            alertService.error("Error", "Falló la eliminación del asistente.");
        } finally {
            setSavingAsistente(false);
        }
    };

    return (
        <AppModal
            open={open}
            onClose={handleModalClose}
            size="lg"
            title={
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">Editar Oferta</span>
                </div>
            }
            footer={
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full border-t border-blue-gray-50 pt-4">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={closeModal}
                        disabled={loading || saving || savingAsistente}
                        className="w-full sm:w-auto capitalize font-bold"
                    >
                        Cancelar
                    </Button>

                    <Button
                        className="bg-[#FFDA00] text-[#2B338C] shadow-md hover:shadow-lg active:opacity-[0.85] w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
                        onClick={handleGuardar}
                        disabled={loading || saving || savingAsistente || !originalData || !hasChanges}
                    >
                        {(loading || saving) && (
                            <div className="h-4 w-4 border-2 border-[#2B338C]/30 border-t-[#2B338C] rounded-full animate-spin" />
                        )}
                        <span className="font-bold">
                            {loading ? "Cargando..." : saving ? "Guardando..." : "Guardar Cambios"}
                        </span>
                    </Button>
                </div>
            }
        >
            <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col gap-6 py-1">
                    <div className="relative overflow-hidden rounded-2xl border border-blue-gray-100 bg-white p-5 shadow-sm">
                        <div className="absolute top-0 left-0 h-1 w-full bg-[#FFDA00]" />

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <Typography className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-gray-400">
                                        Información del Oferta
                                    </Typography>
                                    <Typography className="text-lg sm:text-xl font-black text-[#2B338C] leading-tight">
                                        <span className="opacity-60 font-medium">{originalData?.cursoId}</span> — {originalData?.curso}
                                    </Typography>
                                </div>
                                <div className="shrink-0">
                                    <span className="inline-flex items-center rounded-lg bg-[#2B338C]/5 px-3 py-1.5 text-xs font-bold text-[#2B338C] border border-[#2B338C]/10 uppercase">
                                        {originalData?.modalidad || "—"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <InfoPill label="Sede" value={originalData?.sede} icon="📍" />
                                <InfoPill label="Periodo" value={originalData?.periodo} icon="🗓️" />
                                <InfoPill label="Modalidad" value={originalData?.modalidad} icon="💻" />
                                <InfoPill label="Estado" value={originalData?.estado} icon="📊" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 px-1">
                        <div className="flex items-center justify-between border-b border-blue-gray-50 pb-2">
                            <Typography className="text-[#2B338C] font-extrabold text-sm uppercase tracking-wider">
                                Campos Editables
                            </Typography>
                            {hasChanges && (
                                <div className="flex items-center gap-2 bg-orange-50 px-2 py-1 rounded-md">
                                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[11px] font-bold text-orange-800">Cambios sin guardar</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <Select
                                label="Acción"
                                value={form.accionId}
                                onChange={(v) => setForm((p) => ({ ...p, accionId: v || "" }))}
                                disabled={disabledFields}
                            >
                                {acciones.map((a) => (
                                    <Option key={a.accionId} value={String(a.accionId)}>
                                        {a.nombre}
                                    </Option>
                                ))}
                            </Select>

                            <Select
                                label="Horario"
                                value={form.horarioId}
                                onChange={(v) => setForm((p) => ({ ...p, horarioId: v || "" }))}
                                disabled={disabledFields}
                            >
                                {horarios.map((h) => (
                                    <Option key={h.horarioId} value={String(h.horarioId)}>
                                        {`${h.dia} - ${h.rango}`}
                                    </Option>
                                ))}
                            </Select>

                            <Select
                                label="Coordinador"
                                value={form.coordinadorId}
                                onChange={(v) => setForm((p) => ({ ...p, coordinadorId: v || "" }))}
                                disabled={disabledFields}
                            >
                                {coordinadores.map((c) => (
                                    <Option key={c.id} value={String(c.id)}>
                                        {`${c.nombre} ${c.primerApellido} ${c.segundoApellido}`}
                                    </Option>
                                ))}
                            </Select>

                            <Input
                                label="Grupo"
                                value={form.grupo}
                                onChange={(e) => setForm((p) => ({ ...p, grupo: e.target.value }))}
                                disabled={disabledFields}
                                crossOrigin={undefined}
                            />

                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="w-full">
                                    <Input
                                        type="number"
                                        label="Cupo Máx."
                                        value={form.cupo}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                cupo: e.target.value === "" ? "" : Number(e.target.value),
                                            }))
                                        }
                                        disabled={disabledFields}
                                        crossOrigin={undefined}
                                        className="h-12"
                                    />
                                </div>
                                <div className="w-full">
                                    <Input
                                        type="number"
                                        label="Matriculados"
                                        value={form.matriculados}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                matriculados: e.target.value === "" ? "" : Number(e.target.value),
                                            }))
                                        }
                                        disabled={disabledFields}
                                        crossOrigin={undefined}
                                        className="h-12"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Textarea
                                    label="Comentarios"
                                    value={form.comentarios}
                                    onChange={(e) => setForm((p) => ({ ...p, comentarios: e.target.value }))}
                                    disabled={loading || saving || savingAsistente}
                                />
                            </div>
                        </div>
                    </div>

                    {esOfertaVirtual100 && (
                        <div className="space-y-5 px-1 pt-2">
                            <div className="flex items-center justify-between border-b border-blue-gray-50 pb-2">
                                <Typography className="text-[#2B338C] font-extrabold text-sm uppercase tracking-wider">
                                    Profesores Asistentes
                                </Typography>

                                {!!asistentes.length && (
                                    <span className="text-xs font-bold text-blue-gray-500">
                                        {asistentes.length} asignado(s)
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Input
                                    label="Buscar docente por nombre, apellidos o cédula"
                                    value={filtroDocenteAsistente}
                                    onChange={(e) => setFiltroDocenteAsistente(e.target.value)}
                                    disabled={loading || saving || savingAsistente || isCancelada}
                                    crossOrigin={undefined}
                                />

                                <Select
                                    key={`asistente-${selectedAsistenteId || "none"}`}
                                    label="Seleccionar asistente"
                                    value={selectedAsistenteId}
                                    onChange={(v) => setSelectedAsistenteId(v || "")}
                                    disabled={loading || saving || savingAsistente || isCancelada}
                                    menuProps={menuPropsSafe}
                                    selected={() => {
                                        const d = (docentesFiltradosAsistentes || []).find(
                                            (x) => String(x?.personaId ?? x?.id) === String(selectedAsistenteId)
                                        );
                                        if (!d) return "";
                                        const nombre = `${d?.nombre ?? ""} ${d?.apellido1 ?? d?.primerApellido ?? ""} ${d?.apellido2 ?? d?.segundoApellido ?? ""}`.trim();
                                        const ced = d?.cedula ?? d?.identificacion ?? "";
                                        return `${nombre}${ced ? ` - ${ced}` : ""}`;
                                    }}
                                >
                                    {!docentesFiltradosAsistentes.length ? (
                                        <Option disabled>No hay docentes disponibles</Option>
                                    ) : (
                                        docentesFiltradosAsistentes.map((d) => {
                                            const id = d?.personaId ?? d?.id;
                                            const nombre = `${d?.nombre ?? ""} ${d?.apellido1 ?? d?.primerApellido ?? ""} ${d?.apellido2 ?? d?.segundoApellido ?? ""}`.trim();
                                            const ced = d?.cedula ?? d?.identificacion ?? "";

                                            return (
                                                <Option key={id} value={String(id)}>
                                                    {nombre} {ced ? `- ${ced}` : ""}
                                                </Option>
                                            );
                                        })
                                    )}
                                </Select>

                                <Select
                                    label="Tipo de periodo (Evaluación docente)"
                                    value={tipoPeriodoAsistente || ""}
                                    onChange={(v) => {
                                        setTipoPeriodoAsistente(v || "");
                                        setEvalPeriodoAsistenteId("");
                                    }}
                                    disabled={loading || saving || savingAsistente || isCancelada}
                                    menuProps={menuPropsSafe}
                                >
                                    <Option value="C">Cuatrimestre (C)</Option>
                                    <Option value="T">Trimestre (T)</Option>
                                    <Option value="P">Periodo Mensual (P)</Option>
                                </Select>

                                <Select
                                    label="Periodo (Evaluación docente)"
                                    key={`eval-periodo-asistente-${tipoPeriodoAsistente}-${periodosOrdenadosAsistente.map((p) => p.periodoId).join(",")}`}
                                    value={evalPeriodoAsistenteId ? String(evalPeriodoAsistenteId) : ""}
                                    disabled={!tipoPeriodoAsistente || loading || saving || savingAsistente || isCancelada}
                                    onChange={(v) => setEvalPeriodoAsistenteId(v || "")}
                                    selected={() => {
                                        if (!evalPeriodoAsistenteId) return "Seleccione";
                                        const sel = periodosOrdenadosAsistente.find(
                                            (x) => String(x.periodoId) === String(evalPeriodoAsistenteId)
                                        );
                                        return sel ? `${sel.numero}${sel.tipo} - ${sel.anio}` : "Seleccione";
                                    }}
                                    menuProps={menuPropsSafe}
                                >
                                    <Option value="">Seleccione</Option>
                                    {periodosOrdenadosAsistente.map((p) => (
                                        <Option key={p.periodoId} value={String(p.periodoId)}>
                                            {`${p.numero}${p.tipo} - ${p.anio}`}
                                        </Option>
                                    ))}
                                </Select>

                                <Typography className="text-xs text-blue-gray-600">
                                    Este valor se usará en el texto: “Sus resultados en la Evaluación Docente del ...”.
                                </Typography>

                                <div className="flex justify-end">
                                    <Button
                                        className="bg-[#2B338C] text-white w-full md:w-auto"
                                        onClick={handleAgregarAsistente}
                                        disabled={
                                            loading ||
                                            saving ||
                                            savingAsistente ||
                                            isCancelada ||
                                            !selectedAsistenteId
                                        }
                                    >
                                        {savingAsistente ? "Agregando..." : "Agregar asistente"}
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-blue-gray-100 overflow-hidden">
                                {!asistentes.length ? (
                                    <div className="p-4 text-sm text-blue-gray-500">
                                        No hay asistentes asignados a esta oferta.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-blue-gray-50">
                                        {asistentes.map((a) => {
                                            const nombreCompleto =
                                                a.nombreCompleto ||
                                                [a.nombre, a.primerApellido, a.segundoApellido]
                                                    .filter(Boolean)
                                                    .join(" ");

                                            return (
                                                <div
                                                    key={`${a.personaId}-${a.correo || nombreCompleto}`}
                                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-white"
                                                >
                                                    <div className="min-w-0">
                                                        <Typography className="font-bold text-[#2B338C] text-sm">
                                                            {nombreCompleto || "Sin nombre"}
                                                        </Typography>

                                                        <Typography className="text-xs text-blue-gray-500 truncate">
                                                            {a.correo || "Sin correo"}
                                                        </Typography>

                                                        <div className="mt-2">
                                                            <EstadoSolicitudAsistenteChip
                                                                estadoSolicitudTexto={a.estadoSolicitudTexto}
                                                                estadoEnvio={a.estadoEnvio}
                                                                estadoEnvioTexto={a.estadoEnvioTexto}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outlined"
                                                            className="border-[#2B338C] text-[#2B338C]"
                                                            onClick={() => handleEnviarOfertaAsistente(a)}
                                                            disabled={
                                                                loading ||
                                                                saving ||
                                                                savingAsistente ||
                                                                isCancelada ||
                                                                !a?.personaId
                                                            }
                                                        >
                                                            {savingAsistente
                                                                ? "Enviando..."
                                                                : a?.estadoSolicitudTexto === "Pendiente"
                                                                    ? "Reenviar oferta"
                                                                    : "Enviar oferta"}
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            color="red"
                                                            variant="outlined"
                                                            onClick={() =>
                                                                handleQuitarAsistente(a.personaId, nombreCompleto)
                                                            }
                                                            disabled={
                                                                loading ||
                                                                saving ||
                                                                savingAsistente ||
                                                                isCancelada
                                                            }
                                                        >
                                                            Quitar
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppModal>
    );
}

function EstadoSolicitudAsistenteChip({ estadoSolicitudTexto, estadoEnvio, estadoEnvioTexto }) {
    const texto = estadoSolicitudTexto || "No enviada";

    let className =
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border";

    if (texto === "Aceptada") {
        className += " bg-green-50 text-green-700 border-green-200";
    } else if (texto === "Rechazada") {
        className += " bg-red-50 text-red-700 border-red-200";
    } else if (texto === "Pendiente") {
        className += " bg-amber-50 text-amber-700 border-amber-200";
    } else {
        className += " bg-blue-gray-50 text-blue-gray-600 border-blue-gray-200";
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <span className={className}>{texto}</span>

            {estadoEnvioTexto && (
                <span className="text-[10px] text-blue-gray-400 font-semibold">
                    Envío: {estadoEnvioTexto}
                    {estadoEnvio === 2 ? " ⚠️" : ""}
                </span>
            )}
        </div>
    );
}

function InfoPill({ label, value, icon }) {
    return (
        <div className="flex flex-col gap-1 rounded-xl bg-blue-gray-50/40 p-3 border border-blue-gray-50">
            <span className="text-[10px] font-bold text-blue-gray-400 uppercase tracking-tight">
                {label}
            </span>
            <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs">{icon}</span>
                <span className="text-[13px] font-bold text-blue-gray-800 truncate">
                    {value || "—"}
                </span>
            </div>
        </div>
    );
}