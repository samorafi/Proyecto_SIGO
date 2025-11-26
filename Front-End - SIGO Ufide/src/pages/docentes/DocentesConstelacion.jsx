// src/pages/docentes/DocentesConstelacion.jsx
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Typography } from "@material-tailwind/react";

export default function DocentesConstelacion() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-2 md:p-6 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Constelación docente
          </Typography>
          <Typography className="text-blue-gray-600">
            {id
              ? `Detalle de constelación para el docente #${id}`
              : "Vista general de constelación docente"}
          </Typography>
        </div>

        <Button
          variant="outlined"
          className="border-[#2B338C] text-[#2B338C]"
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
      </div>

      {/* Contenido placeholder */}
      <Card className="p-4">
        <Typography className="text-blue-gray-700">
          Aquí se mostrará la información de constelación del docente
          (asignaciones, grupos, oferta, etc.).  
          De momento se deja este espacio reservado para la futura
          implementación.
        </Typography>
      </Card>
    </div>
  );
}
