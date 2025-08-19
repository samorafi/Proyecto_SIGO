// src/pages/admin.jsx
import { Card, Typography, Chip } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  UsersIcon,
  InboxArrowDownIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

const tiles = [
  {
    to: "/dashboard/admin/roles",
    title: "Administración de Roles",
    desc: "Crea roles y define permisos por módulo.",
    Icon: ShieldCheckIcon,
  },
  {
    to: "/dashboard/admin/usuarios",
    title: "Gestión de Usuarios",
    desc: "Alta/baja, asignación de roles y estados.",
    Icon: UsersIcon,
  },
  {
    to: "/dashboard/admin/solicitudes",
    title: "Solicitudes de registro",
    desc: "Aprueba o rechaza nuevas cuentas.",
    Icon: InboxArrowDownIcon,
  },
  {
    to: "/dashboard/admin/parametros",
    title: "Parámetros del sistema",
    desc: "Catálogos, sedes, periodos y configuraciones.",
    Icon: Cog6ToothIcon,
  },
  {
    to: "/dashboard/admin/auditoria",
    title: "Auditoría",
    desc: "Bitácora de accesos y acciones del sistema.",
    Icon: DocumentMagnifyingGlassIcon,
  },
  {
    to: "/dashboard/admin/notificaciones",
    title: "Notificaciones",
    desc: "Plantillas y reglas de correo/alertas.",
    Icon: BellAlertIcon,
  },
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

export default function Admin() {
  return (
    <div className="p-2 md:p-6 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Administración del sistema
          </Typography>
          <Typography className="text-blue-gray-600 max-w-2xl">
            Panel central de configuración de <b>SIGO</b>. Desde aquí gestionás
            usuarios, roles, catálogos y parámetros generales. (UI maqueta)
          </Typography>
        </div>

        {/* Badges de ejemplo (mock) */}
        <div className="flex items-center gap-2">
          <Chip value="6 módulos" className="bg-[#2B338C] text-white" />
          <Chip value="2 pendientes" className="bg-[#FFDA00] text-[#2B338C]" />
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Tile key={t.to} {...t} />
        ))}
      </div>
    </div>
  );
}
