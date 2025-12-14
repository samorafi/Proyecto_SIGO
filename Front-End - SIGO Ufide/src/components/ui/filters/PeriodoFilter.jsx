import { useMemo, useCallback } from "react";
import { Select, Option } from "@material-tailwind/react";

export default function PeriodoFilter({
    periodos = [],
    tipoPeriodo,
    setTipoPeriodo,
    periodoId,
    setPeriodoId,
}) {

    const periodosFiltrados = useMemo(() => {
        if (!tipoPeriodo) return [];
        return periodos.filter(p => p.tipo === tipoPeriodo);
    }, [periodos, tipoPeriodo]);

    const getPeriodoLabel = useCallback(
        (id) => {
            const p = periodos.find(x => String(x.periodoId) === String(id));
            return p ? `${p.numero}${p.tipo} - ${p.anio}` : "";
        },
        [periodos]
    );

    return (
        <>
            {/* Tipo de período */}
            <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                <Select
                    label="Tipo de período"
                    value={tipoPeriodo}
                    onChange={(v) => {
                        const tipo = v || "";
                        setTipoPeriodo(tipo);
                        setPeriodoId("");
                    }}
                    selected={() =>
                        tipoPeriodo
                            ? tipoPeriodo === "C"
                                ? "Cuatrimestre"
                                : tipoPeriodo === "T"
                                    ? "Trimestre"
                                    : "Periodo"
                            : "Todos"
                    }
                >
                    <Option value="">Todos</Option>
                    <Option value="C">Cuatrimestre</Option>
                    <Option value="T">Trimestre</Option>
                    <Option value="P">Periodo</Option>
                </Select>
            </div>

            {/* Período */}
            <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                <Select
                    label="Periodo"
                    value={periodoId}
                    disabled={!tipoPeriodo}
                    onChange={(v) => setPeriodoId(v || "")}
                    selected={() => {
                        if (!periodoId) return "Todos";
                        return getPeriodoLabel(periodoId) || "Periodo";
                    }}
                >
                    <Option value="">Todos</Option>
                    {periodosFiltrados.map(p => (
                        <Option key={p.periodoId} value={String(p.periodoId)}>
                            {`${p.numero}${p.tipo} - ${p.anio}`}
                        </Option>
                    ))}
                </Select>
            </div>
        </>
    );
}
