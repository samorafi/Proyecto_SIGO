import { Card, Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import {AcademicCapIcon,BookOpenIcon,CalendarDaysIcon,} from "@heroicons/react/24/outline"; 

const tiles = [
  {
    to: "/dashboard/catalogos/carreras",
    title: "Carreras",
    desc: "Administra las carreras y programas académicos.",
    Icon: AcademicCapIcon,
  },
  {
    to: "/dashboard/catalogos/cursos",
    title: "Cursos",
    desc: "Gestiona los cursos asociados a cada carrera.",
    Icon: BookOpenIcon,
  },
  {
    to: "/dashboard/catalogos/periodos",
    title: "Periodos",
    desc: "Configura los trimestres y años académicos.",
    Icon: CalendarDaysIcon,
  }
];

function Tile({ to, title, desc, Icon }) {
  return (
    <Link to={to} className="block">
      <Card className="p-4 h-full hover:shadow-lg transition-shadow border border-blue-gray-50/80">
        <div className="flex items-start gap-3">
          <div className="rounded-lg p-2" style={{ background: "#FFDA00" }}>
            <Icon className="h-6 w-6" style={{ color: "#2B338C" }} />
          </div>
          <div className="min-w-0">
            <Typography className="font-semibold text-[#2B338C]">
              {title}
            </Typography>
            <Typography className="text-sm text-blue-gray-600 line-clamp-2">
              {desc}
            </Typography>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function ParametrosSistema() {
  return (
    <div className="p-2 md:p-6 space-y-4">

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Parámetros del sistema
          </Typography>
          <Typography className="text-blue-gray-600 max-w-2xl">
            Catálogos base del sistema <b>SIGO</b>. Desde aquí administrás carreras,
            cursos, periodos y sedes académicas.
          </Typography>
        </div>
      </div>

      {/* Submódulos de administración de catálogos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Tile key={t.to} {...t} />
        ))}
      </div>
    </div>
  );
}
