import {
    Select,
    Option,
    Input,
    Typography,
    Button
} from "@material-tailwind/react";

import AppModal from "@/components/ui/Modals/AppModal";
import { usePeriodos } from "@/hooks/usePeriodos";

export default function RegistrarOfertaModal({
    open,
    onClose,
    loading,

    form,
    setForm,
    onRegistrar,

    cursos,
    sedes,
    horarios,
    periodos,
    coordinadores,
    estados,
    modalidades,
    modalidadesPermitidas = [],
    modalidadesExcluidas = []
}) {

    const { periodosOrdenados } = usePeriodos(periodos, form?.tipoPeriodo);

    const modalidadesFiltradas = (() => {
        let base = modalidades ?? [];

        if (modalidadesPermitidas.length > 0) {
            base = base.filter(m =>
                modalidadesPermitidas.includes(m.modalidadId)
            );
        }

        if (modalidadesExcluidas.length > 0) {
            base = base.filter(m =>
                !modalidadesExcluidas.includes(m.modalidadId)
            );
        }

        return base;
    })();

    return (
        <AppModal
            open={open}
            onClose={onClose}
            size="md"
            title="Registrar Nueva Oferta"
            footer={
                <>
                    <Button
                        variant="outlined"
                        className="border-[#2B338C] text-[#2B338C] mr-2"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    <Button
                        className="bg-[#FFDA00] text-[#2B338C] font-semibold"
                        onClick={onRegistrar}
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : "Registrar"}
                    </Button>
                </>
            }
        >
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md text-[15px] leading-tight">

                {/* ---------------- DATOS DE LA OFERTA ---------------- */}
                <h2 className="text-[#2B338C] font-bold text-base mb-2 border-b border-gray-300 pb-1">
                    Datos de la Oferta
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">

                    <Select
                        label="Curso"
                        value={form.cursoId || ""}
                        onChange={(v) => setForm(p => ({ ...p, cursoId: Number(v) }))}
                    >
                        {cursos.map(c => (
                            <Option key={c.cursoId} value={c.cursoId}>
                                {c.nombre}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label="Sede"
                        value={form.sedeId || ""}
                        onChange={(v) => setForm(p => ({ ...p, sedeId: Number(v) }))}
                    >
                        {sedes.map(s => (
                            <Option key={s.sedeId} value={s.sedeId}>
                                {s.nombre}
                            </Option>
                        ))}
                    </Select>

                    {/* Periodo
                    <Select
                        label="Tipo de periodo"
                        value={form.tipoPeriodo || ""}
                        onChange={(v) =>
                            setForm(p => ({
                                ...p,
                                tipoPeriodo: v,
                                periodoId: ""
                            }))
                        }
                    >
                        <Option value="C">Cuatrimestre (C)</Option>
                        <Option value="T">Trimestre (T)</Option>
                        <Option value="P">Periodo Mensual (P)</Option>
                    </Select> */}

                    {/* Periodo 
                    <Select
                        label="Periodo"
                        value={form.periodoId || ""}
                        disabled={!form.tipoPeriodo}
                        onChange={(v) => setForm(p => ({ ...p, periodoId: Number(v) }))}
                    >
                        {periodosOrdenados.map(p => (
                            <Option key={p.periodoId} value={p.periodoId}>
                                {`${p.numero}${p.tipo} - ${p.anio}`}
                            </Option>
                        ))}
                    </Select>**/}

                    <Select
                        label="Tipo de periodo"
                        value={form.tipoPeriodo || ""}
                        onChange={(v) =>
                            setForm(prev => ({
                                ...prev,
                                tipoPeriodo: v,
                                periodoId: "", // reset limpio
                            }))
                        }
                    >
                        <Option value="C">Cuatrimestre (C)</Option>
                        <Option value="T">Trimestre (T)</Option>
                        <Option value="P">Periodo Mensual (P)</Option>
                    </Select>

                    <Select
                        label="Periodo"
                        value={form.periodoId || ""}
                        disabled={!form.tipoPeriodo}
                        onChange={(v) =>
                            setForm(prev => ({
                                ...prev,
                                periodoId: v,
                            }))
                        }
                    >
                        {periodosOrdenados.map(p => (
                            <Option key={p.periodoId} value={p.periodoId}>
                                {`${p.numero}${p.tipo} - ${p.anio}`}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label="Horario"
                        value={form.horarioId || ""}
                        onChange={(v) => setForm(p => ({ ...p, horarioId: Number(v) }))}
                    >
                        {horarios.map(h => (
                            <Option key={h.horarioId} value={h.horarioId}>
                                {`${h.dia} - ${h.rango}`}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label="Coordinador"
                        value={form.coordinadorId || ""}
                        onChange={(v) => setForm(p => ({ ...p, coordinadorId: Number(v) }))}
                    >
                        {coordinadores.map(c => (
                            <Option key={c.id} value={c.id}>
                                {`${c.nombre} ${c.primerApellido} ${c.segundoApellido}`.trim()}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* ---------------- MODALIDAD ---------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">
                    <div>
                        <p className="text-[#2B338C] font-bold text-md mb-1">
                            Modalidad de Oferta
                        </p>

                        <Select
                            label="Modalidad"
                            value={form.modalidadId || ""}
                            disabled={modalidadesFiltradas.length === 1}
                            onChange={(v) =>
                                setForm(p => ({ ...p, modalidadId: Number(v) }))
                            }
                        >
                            {modalidadesFiltradas.map(m => (
                                <Option key={m.modalidadId} value={m.modalidadId}>
                                    {m.nombre}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* -------------------------- CUPO Y MATRICULADOS -------------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">

                    {/* Cupo */}
                    <div>
                        <p className="text-[#2B338C] font-bold text-md mb-1">Cupo</p>

                        <Input
                            type="number"
                            label="Cupo"
                            value={form.cupo ?? ""}
                            onChange={(e) =>
                                setForm(p => ({
                                    ...p,
                                    cupo: e.target.value === "" ? null : Number(e.target.value),
                                }))
                            }
                        />
                    </div>

                    {/* Matriculados */}
                    <div>
                        <p className="text-[#2B338C] font-bold text-md mb-1">
                            Estudiantes matriculados
                        </p>

                        <Input
                            type="number"
                            label="Matriculados"
                            value={form.matriculados ?? ""}
                            onChange={(e) =>
                                setForm(p => ({
                                    ...p,
                                    matriculados:
                                        e.target.value === "" ? null : Number(e.target.value),
                                }))
                            }
                        />
                    </div>
                </div>

                {/* ---------------- ACCIÓN ---------------- */}
                <div className="mt-4">
                    <Select
                        label="Acción"
                        value={form.accionId || ""}
                        onChange={(v) =>
                            setForm(p => ({ ...p, accionId: Number(v) }))
                        }
                    >
                        {estados.map(e => (
                            <Option key={e.accionId} value={e.accionId}>
                                {e.nombre}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* ---------------- COMENTARIOS ---------------- */}
                <div className="mt-4">
                    <Input
                        label="Comentarios"
                        value={form.comentarios ?? ""}
                        onChange={(e) =>
                            setForm(p => ({ ...p, comentarios: e.target.value }))
                        }
                    />
                </div>
            </div>
        </AppModal>
    );
}
