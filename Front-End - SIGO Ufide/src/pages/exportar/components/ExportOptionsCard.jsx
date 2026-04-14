import React from "react";
import { Typography } from "@material-tailwind/react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

/**
 * Selector de tipo de exportación con estilo de tarjetas seleccionables.
 * Solo muestra las opciones para las que el usuario tiene permiso.
 */
export const ExportOptionsCard = ({ tipoExport, setTipoExport, canPresencial, canVirtual }) => {
    const options = [
        {
            key: "presencial",
            label: "Presencial y En Línea",
            description: "Exporta las ofertas de modalidad presencial y en línea.",
            enabled: canPresencial,
        },
        {
            key: "virtual",
            label: "100% Virtual",
            description: "Exporta las ofertas de modalidad completamente virtual.",
            enabled: canVirtual,
        },
    ];

    return (
        <div className="w-full">
            <Typography variant="small" className="font-semibold text-blue-gray-700 mb-3">
                Selecciona la modalidad a exportar
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt) =>
                    opt.enabled ? (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => setTipoExport(opt.key)}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 w-full
                                ${
                                    tipoExport === opt.key
                                        ? "border-[#2B338C] bg-[#2B338C]/5 shadow-sm"
                                        : "border-gray-200 hover:border-[#2B338C]/40 hover:bg-gray-50"
                                }`}
                        >
                            <div
                                className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    ${
                                        tipoExport === opt.key
                                            ? "border-[#2B338C]"
                                            : "border-gray-400"
                                    }`}
                            >
                                {tipoExport === opt.key && (
                                    <div className="w-2 h-2 rounded-full bg-[#2B338C]" />
                                )}
                            </div>
                            <div>
                                <Typography
                                    variant="small"
                                    className={`font-semibold ${
                                        tipoExport === opt.key ? "text-[#2B338C]" : "text-blue-gray-700"
                                    }`}
                                >
                                    {opt.label}
                                </Typography>
                                <Typography className="text-xs text-gray-500 mt-0.5">
                                    {opt.description}
                                </Typography>
                            </div>
                        </button>
                    ) : null
                )}
            </div>
        </div>
    );
};
