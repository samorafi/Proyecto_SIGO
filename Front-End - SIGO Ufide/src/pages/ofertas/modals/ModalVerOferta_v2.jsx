import { Typography, Button, Input } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";

export default function ModalVerOferta_v2({
  open,
  onClose,

  loading,
  error,
  data, // fichaData

  accionChips,
  estadoChips,
}) {
  const title = data?.curso
    ? `Ficha de Oferta - ${data.curso} - ${data.sede} - ${data.periodo}`
    : "Ficha de Oferta";

  return (
    <AppModal
      open={open}
      onClose={onClose}
      size="md"
      title={title}
      footer={
        <Button
          className="bg-[#FFDA00] text-[#2B338C] text-md font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-md hover:bg-[#FFD700] transition-all"
          onClick={onClose}
        >
          Cerrar
        </Button>
      }
    >
      {loading && (
        <Typography className="text-blue-gray-600 text-center py-4">
          Cargando información...
        </Typography>
      )}

      {error && (
        <Typography className="text-red-600 text-center py-4">
          {error}
        </Typography>
      )}

      {!loading && !error && (
        
        <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md text-[15px] leading-tight">
            <h2 className="text-[#2B338C] font-bold text-base mb-2 border-b border-gray-300 pb-1">
              Datos de la Ficha
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
              <Campo label="Curso" value={data?.curso} />
              <Campo label="Sede" value={data?.sede} />
              <Campo label="Periodo" value={data?.periodo} />
              <Campo
                label="Horario"
                value={
                  data?.horario ??
                  [data?.horarioDia, data?.horarioHora].filter(Boolean).join(" - ") ??
                  "—"
                }
              />
            </div>

            <div className="mt-4">
              <p className="text-[#2B338C] font-bold text-md mb-1">
                Modalidad de Oferta
              </p>
              <CampoSimple value={data?.modalidad} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">
              <Campo label="Cupo" value={data?.cupo ?? "No definido"} />
              <Campo label="Grupo" value={data?.grupo ?? "No definido"} />
              <Campo label="Matriculados" value={data?.matriculados ?? "No definido"} />
            </div>

            <hr className="my-4 border-gray-300" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
              <Campo label="Coordinador" value={data?.coordinador ?? "Sin asignar"} />
              <Campo label="Profesor" value={data?.persona ?? "Sin asignar"} />
            </div>

            <hr className="my-4 border-gray-300" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
              <div>
                <p className="text-[#2B338C] font-bold mb-1">Acción:</p>
                {accionChips?.(data?.accion) ?? <CampoSimple value={data?.accion} />}
              </div>

              <div>
                <p className="text-[#2B338C] font-bold mb-1">Estado de la Oferta:</p>
                {estadoChips?.(data?.estado) ?? <CampoSimple value={data?.estado} />}
              </div>
            </div>

            <hr className="my-4 border-gray-300" />

            <h2 className="text-[#2B338C] font-bold text-base mb-2 border-b border-gray-300 pb-1">
              Comentarios
            </h2>

            <p className="text-gray-700 text-md leading-relaxed border border-gray-100 rounded-md p-3 bg-gray-50">
              {data?.comentarios || "No cuenta con comentarios."}
            </p>
          </div>
        </div>
      )}
    </AppModal>
  );
}

function Campo({ label, value }) {
  return (
    <div>
      <p className="text-[#2B338C] font-bold mb-1">{label}:</p>
      <CampoSimple value={value ?? "—"} />
    </div>
  );
}

function CampoSimple({ value }) {
  return <p className="text-gray-700 text-md">{value ?? "—"}</p>;
}
