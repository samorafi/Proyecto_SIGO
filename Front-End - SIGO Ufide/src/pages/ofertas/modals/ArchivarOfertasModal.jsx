import { Select, Option, Button, Input, Typography } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";
import { alertService } from "@/services/alert.service";
import { entityConfirm } from "@/services/entityConfirm.service";

export default function ArchivarOfertasModal({
    open,
    onClose,
    onArchived,

    tipoPeriodo,
    setTipoPeriodo,

    selectedPeriodo,
    setSelectedPeriodo,

    selectedModalidad,
    setSelectedModalidad,

    periodosDisponibles,
    modalidades = [],

    modalidadesPermitidas,
    modalidadesExcluidas,
    bloquearModalidad = false,

    loadingArchivar,
    onArchivar,

    entityLabel = "las ofertas",
    successMessage = "Ofertas archivadas correctamente",
}) {
    const modalidadesFiltradas = (modalidades || []).filter((m) => {
        const id = m.modalidadId ?? m.id ?? m.modalidad_id;
        if (Array.isArray(modalidadesPermitidas) && modalidadesPermitidas.length > 0) {
            return modalidadesPermitidas.includes(Number(id));
        }
        if (Array.isArray(modalidadesExcluidas) && modalidadesExcluidas.length > 0) {
            return !modalidadesExcluidas.includes(Number(id));
        }
        return true;
    });

    const handleArchivarClick = async () => {
        const ok = await entityConfirm.archive(entityLabel);
        if (!ok) return;

        try {
            alertService.loading("Archivando...", "Aplicando cambios");

            const result = await onArchivar?.();

            alertService.close();

            if (result && result.ok === false) {
                alertService.error("No se pudo archivar", result.error || "Intenta nuevamente.");
                return;
            }

            const apiMsg =
                result?.mensaje ||
                result?.message ||
                (typeof result === "string" ? result : null);

            if (apiMsg) alertService.success("Archivado completado", apiMsg);
            else alertService.toastSuccess(successMessage);

            onClose?.();
            onArchived?.(result);
        } catch (err) {
            alertService.close();
            alertService.apiError(err, "No se pudieron archivar los registros");
        }
    };
    return (
        <AppModal
            open={open}
            onClose={onClose}
            title="Archivar ofertas por modalidad"
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outlined"
                        className="border-[#2B338C] text-[#2B338C]"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        onClick={handleArchivarClick}
                        disabled={!selectedPeriodo || !selectedModalidad || loadingArchivar}
                        className="bg-[#FFDA00] text-[#2B338C] font-semibold px-6 py-2 rounded-md shadow-none"
                    >
                        {loadingArchivar ? "Archivando..." : "Archivar"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">

                {/* Modalidad */}
                <Select
                    label="Modalidad"
                    value={selectedModalidad || undefined}
                    onChange={(v) => setSelectedModalidad(v || "")}
                    disabled={bloquearModalidad || loadingArchivar}
                >
                    {modalidadesFiltradas.length === 0 ? (
                        <Option disabled>No hay modalidades</Option>
                    ) : (
                        modalidadesFiltradas.map((m) => {
                            const id = m.modalidadId ?? m.id ?? m.modalidad_id;
                            const nombre = m.nombre ?? m.name ?? m.descripcion;
                            return (
                                <Option key={id} value={String(id)}>
                                    {nombre}
                                </Option>
                            );
                        })
                    )}
                </Select>

                {/* Tipo de periodo */}
                <Select label="Tipo de periodo" value={tipoPeriodo} onChange={setTipoPeriodo}>
                    <Option value="C">Cuatrimestre (C)</Option>
                    <Option value="T">Trimestre (T)</Option>
                    <Option value="P">Periodo (P)</Option>
                </Select>

                {/* Periodo */}
                <Select
                    label="Periodo"
                    value={selectedPeriodo || undefined}
                    onChange={(v) => setSelectedPeriodo(v || "")}
                    disabled={periodosDisponibles.length === 0}
                >
                    {periodosDisponibles.length === 0 ? (
                        <Option disabled>No hay periodos disponibles</Option>
                    ) : (
                        periodosDisponibles.map((p) => (
                            <Option key={p.periodoId} value={String(p.periodoId)}>
                                {p.etiqueta}
                            </Option>
                        ))
                    )}
                </Select>


            </div>
        </AppModal>
    );
}