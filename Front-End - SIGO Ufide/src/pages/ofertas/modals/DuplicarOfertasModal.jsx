import { Select, Option, Button, Input } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";

export default function DuplicarOfertasModal({
    open,
    onClose,
    modalidad,
    setModalidad,
    tipoPeriodo,
    setTipoPeriodo,
    periodoOrigen,
    setPeriodoOrigen,
    periodoDestino,
    setPeriodoDestino,
    periodosOrigenFiltrados,
    periodosDestinoFiltrados,
    loading,
    mensaje,
    onDuplicar
}) {
    return (
        <AppModal
            open={open}
            onClose={onClose}
            title="Duplicar ofertas por periodo"
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
                        disabled={
                            !periodoOrigen ||
                            !periodoDestino ||
                            !modalidad ||
                            loading
                        }
                        className="bg-[#FFDA00] text-[#2B338C] font-semibold"
                        onClick={onDuplicar}
                    >
                        {loading ? "Duplicando..." : "Duplicar"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-4">

                {/* Modalidad */}
                <Select
                    label="Modalidad"
                    value={modalidad || undefined}
                    onChange={(v) => setModalidad(v)}
                >
                    <Option value="1">Presencial</Option>
                    <Option value="2">Virtual</Option>
                    <Option value="3">En Línea</Option>
                </Select>

                {/* Tipo de periodo */}
                <Select
                    label="Tipo de periodo"
                    value={tipoPeriodo}
                    onChange={setTipoPeriodo}
                >
                    <Option value="C">Cuatrimestre (C)</Option>
                    <Option value="T">Trimestre (T)</Option>
                    <Option value="P">Periodo (P)</Option>
                </Select>

                {/* Periodo Origen */}
                <Select
                    label="Periodo origen"
                    value={periodoOrigen || undefined}
                    onChange={(v) => setPeriodoOrigen(v)}
                >
                    {periodosOrigenFiltrados.map((p) => (
                        <Option key={p.periodoId} value={String(p.periodoId)}>
                            {p.etiqueta}
                        </Option>
                    ))}
                </Select>

                {/* Periodo Destino */}
                <Select
                    label="Periodo destino"
                    value={periodoDestino || undefined}
                    onChange={(v) => setPeriodoDestino(v)}
                >
                    {periodosDestinoFiltrados.map((p) => (
                        <Option key={p.periodoId} value={String(p.periodoId)}>
                            {p.etiqueta}
                        </Option>
                    ))}
                </Select>

                {mensaje && (
                    <div className="p-3 text-blue-800 bg-blue-50 border border-blue-200 rounded text-sm">
                        {mensaje}
                    </div>
                )}

            </div>
        </AppModal>
    );
}
