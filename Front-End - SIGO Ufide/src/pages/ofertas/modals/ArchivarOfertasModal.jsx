import { Select, Option, Button, Input, Typography } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";

export default function ArchivarOfertasModal({
    open,
    onClose,

    tipoPeriodo,
    setTipoPeriodo,

    selectedPeriodo,
    setSelectedPeriodo,

    periodosDisponibles,

    loadingArchivar,
    onArchivar
}) {
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
                        disabled={!selectedPeriodo || loadingArchivar}
                        className="bg-[#FFDA00] text-[#2B338C] font-semibold"
                        onClick={onArchivar}
                    >
                        {loadingArchivar ? "Archivando..." : "Archivar"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">

                {/* Modalidad fija */}
                <div>
                    <p className="text-sm font-medium text-blue-gray-700 mb-1">
                        Modalidad
                    </p>
                    <Input
                        value="En Línea"
                        disabled
                        className="bg-gray-100 text-[#2B338C] font-semibold"
                    />
                </div>

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
                    onChange={(v) => setSelectedPeriodo(v)}
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
