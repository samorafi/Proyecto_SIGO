import React from "react";
import { Typography } from "@material-tailwind/react";
import { DocumentArrowUpIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const DragAndDropZone = ({
    isDragActive,
    file,
    fileInputRef,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onFileChange,
    onRemoveFile,
}) => {
    return (
        <div
            className={`w-full p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={onFileChange}
            />

            {!file ? (
                <>
                    <DocumentArrowUpIcon
                        className={`w-16 h-16 mb-4 ${isDragActive ? "text-blue-500" : "text-gray-400"
                            }`}
                    />
                    <Typography variant="h6" color="blue-gray" className="mb-1 text-center">
                        Arrastra tu Excel aquí
                    </Typography>
                    <Typography color="gray" className="text-sm text-center">
                        o haz clic para buscar el archivo (.xlsx, .xls)
                    </Typography>
                </>
            ) : (
                <div
                    className="flex flex-col items-center justify-center w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative p-6 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center gap-4 w-full max-w-sm">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <Typography
                                variant="h6"
                                color="blue-gray"
                                className="truncate text-sm"
                                title={file.name}
                            >
                                {file.name}
                            </Typography>
                            <Typography className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                        </div>

                        <button
                            type="button"
                            onClick={onRemoveFile}
                            className="bg-transparent border-0 p-1 text-gray-500 hover:text-red-500 transition-colors"
                            title="Remover archivo"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <Typography color="gray" className="text-sm text-center mt-6">
                        Haz clic aquí para cambiar el archivo
                    </Typography>
                </div>
            )}
        </div>
    );
};
