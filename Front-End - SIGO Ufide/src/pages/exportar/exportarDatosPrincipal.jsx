import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useExcelExport } from "./hooks/useExcelExport";
import { usePeriodosExport } from "./hooks/usePeriodosExport";
import { ExportOptionsCard } from "./components/ExportOptionsCard";
import { PeriodoSelector } from "./components/PeriodoSelector";

export default function ExportarDatosPrincipal() {
    const { hasPermission } = useAuth();
    const navigate = useNavigate();

    const canPresencial = hasPermission("ADMIN_VIEW") || hasPermission("OFERTAS_PRESENCIAL_EN_LINEA_VIEW");
    const canVirtual = hasPermission("ADMIN_VIEW") || hasPermission("OFERTAS_VIRTUALES_VIEW");
    const canExport = canPresencial || canVirtual;

    const { periodos, loading: loadingPeriodos, error: errorPeriodos } = usePeriodosExport();

    const {
        periodoId,
        setPeriodoId,
        tipoExport,
        setTipoExport,
        isLoading,
        handleExport,
    } = useExcelExport();

    // Si el usuario seleccionó un tipo al que no tiene permiso, forzar el tipo correcto
    React.useEffect(() => {
        if (tipoExport === "presencial" && !canPresencial && canVirtual) {
            setTipoExport("virtual");
        }
        if (tipoExport === "virtual" && !canVirtual && canPresencial) {
            setTipoExport("presencial");
        }
    }, [canPresencial, canVirtual]);

    if (!canExport) {
        return (
            <div className="flex flex-col items-center justify-center p-8 mt-10">
                <Typography variant="h4" color="red" className="mb-2">
                    Acceso Denegado
                </Typography>
                <Typography color="gray">
                    No tienes los permisos necesarios para acceder a esta vista.
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Typography className="text-2xl font-extrabold text-[#2B338C]">
                        Exportar Datos de Ofertas
                    </Typography>
                    <Typography className="text-blue-gray-600">
                        Descarga masiva de datos de ofertas académicas en formato Excel (.xlsx)
                    </Typography>
                </div>
                <Button
                    variant="outlined"
                    className="flex items-center gap-2 border-[#2B338C] text-[#2B338C] hover:bg-[#FFFFFF]/20 transition-colors"
                    onClick={() => navigate("/dashboard/admin")}
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Regresar
                </Button>
            </div>

            <Card className="max-w-3xl mx-auto shadow-lg">
                <CardBody className="flex flex-col items-center gap-6">
                    <div className="text-center">
                        <Typography variant="h5" color="blue-gray" className="mb-1">
                            Configurar Exportación
                        </Typography>
                        <Typography
                            color="gray"
                            className="font-normal text-center w-full md:w-2/3 mx-auto"
                        >
                            Selecciona la modalidad y el período académico para generar y
                            descargar el archivo Excel correspondiente.
                        </Typography>
                    </div>

                    {/* Ícono decorativo */}
                    <div className="p-5 bg-blue-50 rounded-full">
                        <ArrowDownTrayIcon className="w-12 h-12 text-[#2B338C]" />
                    </div>

                    {/* Selector de tipo de exportación */}
                    <div className="w-full">
                        <ExportOptionsCard
                            tipoExport={tipoExport}
                            setTipoExport={setTipoExport}
                            canPresencial={canPresencial}
                            canVirtual={canVirtual}
                        />
                    </div>

                    {/* Selector de período */}
                    <div className="w-full">
                        <PeriodoSelector
                            periodoId={periodoId}
                            setPeriodoId={setPeriodoId}
                            periodos={periodos}
                            loading={loadingPeriodos}
                            error={errorPeriodos}
                        />
                    </div>

                    {/* Botón principal */}
                    <div className="mt-2 flex justify-center w-full">
                        <Button
                            className="px-8 bg-[#2B338C] flex items-center gap-2 disabled:bg-[#2B338C]/50 disabled:cursor-not-allowed"
                            size="lg"
                            disabled={!periodoId || isLoading || loadingPeriodos}
                            onClick={handleExport}
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                            {isLoading ? "Generando..." : "Exportar Archivo"}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
