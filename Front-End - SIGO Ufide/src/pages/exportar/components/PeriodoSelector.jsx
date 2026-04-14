import React from "react";
import { Typography } from "@material-tailwind/react";

/**
 * Selector de período académico.
 * Muestra un <select> con los períodos disponibles desde la API.
 */
export const PeriodoSelector = ({ periodoId, setPeriodoId, periodos, loading, error }) => {
    return (
        <div className="w-full">
            <Typography variant="small" className="font-semibold text-blue-gray-700 mb-2">
                Período académico
            </Typography>

            {error ? (
                <Typography className="text-sm text-red-500">{error}</Typography>
            ) : (
                <select
                    value={periodoId}
                    onChange={(e) => setPeriodoId(e.target.value)}
                    disabled={loading}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm text-blue-gray-800 bg-white
                        transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B338C]/40
                        ${loading ? "opacity-60 cursor-not-allowed border-gray-200" : "border-gray-300 hover:border-[#2B338C]/50 cursor-pointer"}`}
                >
                    <option value="">
                        {loading ? "Cargando períodos..." : "— Seleccione un período —"}
                    </option>
                    {periodos.length === 0 && !loading ? (
                        <option value="" disabled>
                            Sin períodos definidos en el sistema
                        </option>
                    ) : (
                        periodos.map((p) => (
                            <option key={p.periodoId} value={p.periodoId}>
                                {p.etiqueta ?? `Período ${p.periodoId}`}
                            </option>
                        ))
                    )}
                </select>
            )}
        </div>
    );
};
