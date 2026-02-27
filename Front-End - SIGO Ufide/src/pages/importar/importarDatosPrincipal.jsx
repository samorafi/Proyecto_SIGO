import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useExcelUpload } from "./hooks/useExcelUpload";
import { DragAndDropZone } from "./components/DragAndDropZone";

export default function ImportarDatosPrincipal() {
    const { hasPermission } = useAuth();
    const navigate = useNavigate();

    const {
        isDragActive,
        file,
        fileInputRef,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileChange,
        removeFile,
        handleUpload,
    } = useExcelUpload();

    if (!hasPermission("ADMIN_VIEW")) {
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
                        Importar Datos de Ofertas
                    </Typography>
                    <Typography className="text-blue-gray-600">
                        Consola de importación masiva de datos mediante Excel (.xls, .xlsx)
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
                <CardBody className="flex flex-col items-center">
                    <Typography variant="h5" color="blue-gray" className="mb-2 text-center">
                        Carga de Archivos
                    </Typography>
                    <Typography
                        color="gray"
                        className="mb-8 font-normal text-center w-full md:w-2/3"
                    >
                        Selecciona o arrastra el archivo de Excel con los datos de las
                        ofertas para importarlos al sistema.
                    </Typography>

                    <DragAndDropZone
                        isDragActive={isDragActive}
                        file={file}
                        fileInputRef={fileInputRef}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onFileChange={handleFileChange}
                        onRemoveFile={removeFile}
                    />

                    <div className="mt-8 flex justify-center w-full">
                        <Button
                            className="px-8 bg-[#2B338C] disabled:bg-[#2B338C]/50 disabled:cursor-not-allowed"
                            size="lg"
                            disabled={!file}
                            onClick={handleUpload}
                        >
                            Importar Archivo
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
