import { useState, useEffect, useMemo } from "react";
import {
    Select,
    Option,
    Input,
    Button,
    Typography,
    Card,
    Textarea,
} from "@material-tailwind/react";

import AppModal from "@/components/ui/Modals/AppModal";
import EditarFichaOferta from "@/pages/ofertas/functions/EditarFichaOferta_v2";
import { alertService } from "@/services/alert.service";
import VerOfertaEditar from "../functions/VerFichaOferta_v2";


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
}) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [form, setForm] = useState(emptyForm);

    // Reset cuando se cierra
    useEffect(() => {
        if (!open) {
            setLoading(false);
            setSaving(false);
            setOriginalData(null);
            setForm(emptyForm);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !ofertaId) return;

        let cancelled = false;

        const cargarDatos = async () => {
            try {
                setLoading(true);
                const res = await VerOfertaEditar(ofertaId);
                if (cancelled) return;

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
                    alertService.error("Error", res.error || "No se pudo obtener la información.");
                    onClose?.();
                }
            } catch (e) {
                alertService.error("Error", "Falló la carga de la oferta.");
                onClose?.();
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        cargarDatos();
        return () => {
            cancelled = true;
        };
    }, [open, ofertaId, onClose]);

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

        try {
            setSaving(true);

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

            if (res.ok) {
                alertService.toastSuccess("Oferta actualizada correctamente");
                onSuccess?.();
                onClose?.();
            } else {
                alertService.error("Error", res.error || "No se pudo actualizar la oferta.");
            }
        } catch (e) {
            alertService.error("Error", "Falló la actualización de la oferta.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppModal
            open={open}
            onClose={onClose}
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
                        onClick={onClose}
                        disabled={loading || saving}
                        className="w-full sm:w-auto capitalize font-bold"
                    >
                        Cancelar
                    </Button>

                    <Button
                        className="bg-[#FFDA00] text-[#2B338C] shadow-md hover:shadow-lg active:opacity-[0.85] w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
                        onClick={handleGuardar}
                        disabled={loading || saving || !originalData || !hasChanges}
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
            <div className="flex flex-col gap-6">

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
                            {/* Aquí ya no es estático "Activo", usa el estado real */}
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
                            disabled={loading || saving}
                        >
                            {acciones.map((a) => (
                                <Option key={a.accionId} value={String(a.accionId)}>{a.nombre}</Option>
                            ))}
                        </Select>

                        <Select
                            label="Horario"
                            value={form.horarioId}
                            onChange={(v) => setForm((p) => ({ ...p, horarioId: v || "" }))}
                            disabled={loading || saving}
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
                            disabled={loading || saving}
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
                            disabled={loading || saving}
                            crossOrigin={undefined}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label="Cupo"
                                value={form.cupo}
                                onChange={(e) => setForm((p) => ({ ...p, cupo: e.target.value === "" ? "" : Number(e.target.value) }))}
                                disabled={loading || saving}
                                crossOrigin={undefined}
                            />
                            <Input
                                type="number"
                                label="Matriculados"
                                value={form.matriculados}
                                onChange={(e) => setForm((p) => ({ ...p, matriculados: e.target.value === "" ? "" : Number(e.target.value) }))}
                                disabled={loading || saving}
                                crossOrigin={undefined}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Textarea
                                label="Comentarios"
                                value={form.comentarios}
                                onChange={(e) => setForm((p) => ({ ...p, comentarios: e.target.value }))}
                                disabled={loading || saving}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppModal>
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
