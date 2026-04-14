import {
    Select,
    Option,
    Input,
    Typography,
    Button
} from "@material-tailwind/react";

import AppModal from "@/components/ui/Modals/AppModal";
import { usePeriodos } from "@/hooks/usePeriodos";


export default function FichaOfertaModal({
    open,
    onClose,
    modo,
    isNuevo,
    editMode,
    OfertaCancelada,
    fichaLoading,
    fichaError,
    fichaData,
    fichaForm,

    cursos,
    sedes,
    horarios,
    periodos,
    coordinadores,
    estados,
    personas,
    modalidades = [1, 2, 3],


    setFichaForm,
    onGuardar,
    onRegistrar,

    accionChips,
    estadoChips,
}) {

    const {
        periodosOrdenados
    } = usePeriodos(periodos, fichaForm?.tipoPeriodo);

    return (
        <AppModal
            open={open}
            onClose={onClose}
            size="md"
            title={
                modo === "nuevo"
                    ? "Registrar Nueva Oferta"
                    : modo === "editar"
                        ? "Editar Ficha de Oferta"
                        : `Ficha de Oferta ${fichaData?.curso
                            ? `- ${fichaData.curso} - ${fichaData.sede} - ${fichaData.periodo}`
                            : ""
                        }`
            }
            footer={
                isNuevo ? (
                    <>
                        <Button
                            variant="outlined"
                            className="border-[#2B338C] text-[#2B338C] mr-2"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>

                        <Button
                            className="bg-[#FFDA00] text-[#2B338C] font-semibold"
                            onClick={onRegistrar}
                        >
                            Registrar
                        </Button>
                    </>
                ) : editMode ? (
                    <>
                        <Button
                            variant="outlined"
                            className="border-[#2B338C] text-[#2B338C] mr-2"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>

                        <Button
                            className="bg-[#FFDA00] text-[#2B338C] font-semibold"
                            onClick={onGuardar}
                        >
                            Guardar
                        </Button>
                    </>
                ) : (
                    <Button
                        className="bg-[#FFDA00] text-[#2B338C] text-md font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-md hover:bg-[#FFD700] transition-all"
                        onClick={onClose}
                    >
                        Cerrar
                    </Button>
                )
            }
        >
            {fichaLoading && (
                <Typography className="text-blue-gray-600 text-center py-4">
                    Cargando información...
                </Typography>
            )}

            {fichaError && (
                <Typography className="text-red-600 text-center py-4">
                    {fichaError}
                </Typography>
            )}

            {!fichaLoading && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md text-[15px] leading-tight">

                    {/* -------------------------- DATOS DE LA FICHA -------------------------- */}
                    <h2 className="text-[#2B338C] font-bold mb-1 text-base mb-2 border-b border-gray-300 pb-1">
                        Datos de la Ficha
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">

                        {/* Curso */}
                        <Select
                            label="Curso"
                            value={fichaForm?.cursoId || ""}
                            disabled={!editMode || OfertaCancelada}
                            onChange={(v) =>
                                setFichaForm((prev) => ({ ...prev, cursoId: Number(v) }))
                            }
                        >
                            {cursos.map((c) => (
                                <Option key={c.cursoId} value={c.cursoId}>
                                    {c.nombre}
                                </Option>
                            ))}
                        </Select>

                        {/* Sede */}
                        <Select
                            label="Sede"
                            value={fichaForm?.sedeId || ""}
                            disabled={!editMode || OfertaCancelada}
                            onChange={(v) =>
                                setFichaForm((prev) => ({ ...prev, sedeId: Number(v) }))
                            }
                        >
                            {sedes.map((s) => (
                                <Option key={s.sedeId} value={s.sedeId}>
                                    {s.nombre}
                                </Option>
                            ))}
                        </Select>

                        {/* Tipo de periodo */}
                        <Select
                            label="Tipo de periodo"
                            value={fichaForm?.tipoPeriodo || ""}
                            disabled={!editMode || OfertaCancelada}
                            onChange={(v) =>
                                setFichaForm((prev) => ({ ...prev, tipoPeriodo: v }))
                            }
                        >
                            <Option value="C">Cuatrimestre (C)</Option>
                            <Option value="T">Trimestre (T)</Option>
                            <Option value="P">Periodo Mensual (P)</Option>
                        </Select>

                        {/* Periodo */}
                        <Select
                            label="Periodo"
                            value={fichaForm?.periodoId || ""}
                            disabled={!editMode || OfertaCancelada}
                            onChange={(v) =>
                                setFichaForm((prev) => ({ ...prev, periodoId: Number(v) }))
                            }
                        >
                            {periodosOrdenados.map((p) => (
                                <Option key={p.periodoId} value={p.periodoId}>
                                    {`${p.numero}${p.tipo} - ${p.anio}`}
                                </Option>
                            ))}
                        </Select>

                        {/* Horario */}
                        <Select
                            label="Horario"
                            value={fichaForm?.horarioId || ""}
                            disabled={!editMode || OfertaCancelada}
                            onChange={(v) =>
                                setFichaForm((prev) => ({ ...prev, horarioId: Number(v) }))
                            }
                        >
                            {horarios.map((h) => (
                                <Option key={h.horarioId} value={h.horarioId}>
                                    {`${h.dia} - ${h.rango}`}
                                </Option>
                            ))}
                        </Select>

                    </div>

                    {/* Modalidad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">
                        <div>
                            <p className="text-[#2B338C] font-bold mb-1 text-md mb-1">Modalidad de Oferta</p>

                            {/* Modalidad */}
                            <Select
                                label="Modalidad"
                                value={fichaForm?.modalidadId || ""}
                                disabled={true}
                                onChange={(v) =>
                                    setFichaForm((prev) => ({ ...prev, modalidadId: Number(v) }))
                                }
                            >
                                {modalidades.map((m) => (
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
                            <p className="text-[#2B338C] font-bold mb-1 text-md mb-1">Cupo</p>

                            {editMode ? (
                                <Input
                                    type="number"
                                    label="Cupo"
                                    value={fichaForm?.cupo ?? ""}
                                    disabled={OfertaCancelada}
                                    onChange={(e) =>
                                        setFichaForm((prev) => ({
                                            ...prev,
                                            cupo:
                                                e.target.value === "" ? null : Number(e.target.value),
                                        }))
                                    }
                                />
                            ) : (
                                <p className="text-gray-700 text-md">
                                    {fichaData?.cupo ?? "No definido"}
                                </p>
                            )}
                        </div>

                        {/* Grupo */}
                        <div>
                            <p className="text-[#2B338C] font-bold mb-1 text-md mb-1">
                                Grupo
                            </p>

                            {editMode ? (
                                <Input
                                    type="number"
                                    label="Grupo"
                                    value={fichaForm?.grupo ?? ""}
                                    disabled={OfertaCancelada}
                                    onChange={(e) =>
                                        setFichaForm((prev) => ({
                                            ...prev,
                                            grupo:
                                                e.target.value === "" ? null : Number(e.target.value),
                                        }))
                                    }
                                />
                            ) : (
                                <p className="text-gray-700 text-md">
                                    {fichaData?.grupo ?? "No definido"}
                                </p>
                            )}
                        </div>
                        {/* Matriculados */}
                        <div>
                            <p className="text-[#2B338C] font-bold mb-1 text-md mb-1">
                                Estudiantes matriculados
                            </p>

                            {editMode ? (
                                <Input
                                    type="number"
                                    label="Matriculados"
                                    value={fichaForm?.matriculados ?? ""}
                                    disabled={OfertaCancelada}
                                    onChange={(e) =>
                                        setFichaForm((prev) => ({
                                            ...prev,
                                            matriculados:
                                                e.target.value === "" ? null : Number(e.target.value),
                                        }))
                                    }
                                />
                            ) : (
                                <p className="text-gray-700 text-md">
                                    {fichaData?.matriculados ?? "No definido"}
                                </p>
                            )}
                        </div>
                    </div>

                    <hr className="my-4 border-gray-300" />

                    {/* -------------------------- RESPONZABLES -------------------------- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">

                        <div>
                            <p className="text-[#2B338C] font-bold mb-1">Coordinador:</p>
                            <Select
                                label="Coordinador"
                                value={fichaForm?.coordinadorId || ""}
                                disabled={!editMode || OfertaCancelada}
                                onChange={(v) =>
                                    setFichaForm((prev) => ({ ...prev, coordinadorId: Number(v) }))
                                }
                            >
                                {coordinadores.map((c) => (
                                    <Option key={c.id} value={c.id}>
                                        {`${c.nombre} ${c.primerApellido} ${c.segundoApellido}`.trim()}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <p className="text-[#2B338C] font-bold mb-1 mb-1">Profesor:</p>

                            <Input
                                label="Profesor"
                                value={(() => {
                                    if (!fichaForm?.personaId) return "Sin asignar";

                                    const p = personas.find(
                                        x => String(x.personaId) === String(fichaForm.personaId)
                                    );

                                    return p
                                        ? `${p.nombre} ${p.primerApellido} ${p.segundoApellido}`.trim()
                                        : "Sin asignar";
                                })()}
                                disabled
                            />
                        </div>

                    </div>

                    <hr className="my-4 border-gray-300" />

                    {/* -------------------------- ACCIÓN Y ESTADO -------------------------- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
                        {!editMode ? (
                            <>
                                <div>
                                    <p className="text-[#2B338C] font-bold mb-1">Acción:</p>
                                    {accionChips(fichaData?.accion)}
                                </div>

                                <div>
                                    <p className="text-[#2B338C] font-bold mb-1">Estado de la Oferta:</p>
                                    {estadoChips(fichaData?.estado)}
                                </div>
                            </>
                        ) : (
                            <Select
                                label="Acción"
                                value={fichaForm?.accionId || ""}
                                disabled={OfertaCancelada}
                                onChange={(v) =>
                                    setFichaForm((prev) => ({ ...prev, accionId: Number(v) }))
                                }
                            >
                                {estados.map((e) => (
                                    <Option key={e.accionId} value={e.accionId}>
                                        {e.nombre}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </div>

                    <hr className="my-4 border-gray-300" />

                    {/* -------------------------- COMENTARIOS -------------------------- */}
                    <h2 className="text-[#2B338C] font-bold mb-1 text-base mb-2 border-b border-gray-300 pb-1">
                        Comentarios
                    </h2>

                    {!editMode ? (
                        <p className="text-gray-700 text-md leading-relaxed border border-gray-100 rounded-md p-3 bg-gray-50">
                            {fichaData?.comentarios || "No cuenta con comentarios."}
                        </p>
                    ) : (
                        <Input
                            label="Comentarios"
                            value={fichaForm?.comentarios ?? ""}
                            disabled={OfertaCancelada}
                            onChange={(e) =>
                                setFichaForm((prev) => ({
                                    ...prev,
                                    comentarios: e.target.value,
                                }))
                            }
                        />
                    )}
                </div>
            )}
        </AppModal>
    );
}
