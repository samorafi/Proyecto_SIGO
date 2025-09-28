// src/pages/notificaciones.jsx
import { useMemo, useState } from "react";
import {
  Card,
  Typography,
  Chip,
  Input,
  Select,
  Option,
  Switch,
  Button,
} from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import CuatrimestrePicker from "@/components/PickerQuarter";

// --- MOCK (UI) ---
const MOCK = [
  {
    id: 1,
    docente: "Andrea Vargas",
    correo: "andrea.vargas@ufide.ac.cr",
    oferta: "Programación I (ING-102) • 1Q-2025",
    estado: "aceptada",
    fecha: "2025-08-10 10:15",
    leida: false,
  },
  {
    id: 2,
    docente: "Carlos Solís",
    correo: "carlos.solis@ufide.ac.cr",
    oferta: "Cálculo II (MAT-204) • 1Q-2025",
    estado: "rechazada",
    fecha: "2025-08-10 09:02",
    leida: false,
  },
  {
    id: 3,
    docente: "María López",
    correo: "maria.lopez@ufide.ac.cr",
    oferta: "Bases de Datos (INF-210) • 2Q-2025",
    estado: "pendiente",
    fecha: "2025-05-12 17:40",
    leida: true,
  },
  {
    id: 4,
    docente: "Luis Fernández",
    correo: "luis.fernandez@ufide.ac.cr",
    oferta: "Proyectos de Software (ING-350) • 3Q-2024",
    estado: "aceptada",
    fecha: "2024-10-03 14:22",
    leida: true,
  },
];

const statusMeta = {
  aceptada: { label: "Aceptada", color: "green", Icon: CheckCircleIcon },
  rechazada: { label: "Rechazada", color: "red", Icon: XCircleIcon },
  pendiente: { label: "Pendiente", color: "amber", Icon: ClockIcon },
};

// Helpers para cuatrimestre desde fecha
function cuatriFromDateString(isoLike) {
  const d = new Date(isoLike.replace(" ", "T"));
  const m = d.getMonth();
  const q = m <= 3 ? "I" : m <= 7 ? "II" : "III";
  const year = String(d.getFullYear());
  return { q, year };
}
function matchesCuatri(item, cuatri) {
  if (cuatri.q === "Todos" || cuatri.year === "Todos") return true;
  const c = cuatriFromDateString(item.fecha);
  return c.q === cuatri.q && c.year === cuatri.year;
}

function NotiItem({ item }) {
  const { Icon } = statusMeta[item.estado];
  const tone =
    item.estado === "aceptada"
      ? "bg-green-100 text-green-800"
      : item.estado === "rechazada"
      ? "bg-red-100 text-red-800"
      : "bg-amber-100 text-amber-800";

  return (
    <Card className={`p-4 border ${item.leida ? "opacity-80" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2 shrink-0" style={{ background: "#FFDA00" }}>
          <Icon className="h-6 w-6" style={{ color: "#2B338C" }} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Título + chips */}
          <div className="flex flex-wrap items-center gap-2">
            <Typography className="font-semibold text-[#2B338C] truncate">
              {item.docente}
            </Typography>
            <Chip variant="ghost" value={statusMeta[item.estado].label} className={`${tone} h-6 text-[12px]`} />
            {!item.leida && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#2B338C] text-white">
                nuevo
              </span>
            )}
          </div>

          {/* Detalle */}
          <Typography className="text-sm text-blue-gray-700 truncate">
            {item.oferta}
          </Typography>

          <Typography className="text-xs text-blue-gray-400 mt-1 truncate">
            {item.correo} • {item.fecha}
          </Typography>

          {/* Acciones: full width en móvil, inline en md+ */}
          <div className="mt-3 grid grid-cols-1 sm:flex sm:items-center sm:gap-2">
            <Link to="/dashboard/ofertas" className="sm:w-auto">
              <Button
                size="sm"
                variant="outlined"
                className="w-full sm:w-auto border-[#2B338C] text-[#2B338C] flex items-center justify-center gap-2"
              >
                <EyeIcon className="h-4 w-4" />
                Ver oferta
              </Button>
            </Link>

            <Button
              size="sm"
              className="mt-2 sm:mt-0 w-full sm:w-auto bg-[#FFDA00] text-[#2B338C]"
              onClick={() => console.log("Marcar como leído (UI)", item.id)}
            >
              Marcar como leído
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Notificaciones() {
  const [term, setTerm] = useState("");
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [estado, setEstado] = useState("todos");
  const [cuatri, setCuatri] = useState({ q: "Todos", year: "Todos" });

  const items = useMemo(() => {
    return MOCK.filter((n) => {
      if (soloNoLeidas && n.leida) return false;
      if (estado !== "todos" && n.estado !== estado) return false;
      if (!matchesCuatri(n, cuatri)) return false;
      const t = term.toLowerCase();
      if (!t) return true;
      return (
        n.docente.toLowerCase().includes(t) ||
        n.oferta.toLowerCase().includes(t) ||
        n.correo.toLowerCase().includes(t)
      );
    });
  }, [term, soloNoLeidas, estado, cuatri]);

  const resumen = useMemo(() => {
    const acc = { aceptada: 0, rechazada: 0, pendiente: 0 };
    MOCK.forEach((n) => (acc[n.estado] += 1));
    return acc;
  }, []);

  return (
    <div className="p-2 md:p-6 space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Notificaciones
          </Typography>
          <Typography className="text-blue-gray-600 max-w-2xl">
            Estado de las <b>ofertas enviadas a docentes</b>. Cuando una oferta es
            <span className="font-semibold"> aceptada</span> o
            <span className="font-semibold"> rechazada</span>, se registra aquí.
          </Typography>
        </div>

        {/* Chips grandes: solo en md+; en mobile los pasamos al sidebar de abajo */}
        <div className="hidden md:flex items-center gap-2">
          <Chip value={`Aceptadas: ${resumen.aceptada}`} className="bg-green-600 text-white" />
          <Chip value={`Rechazadas: ${resumen.rechazada}`} className="bg-red-600 text-white" />
          <Chip value={`Pendientes: ${resumen.pendiente}`} className="bg-amber-500 text-white" />
        </div>
      </div>

      {/* Filtro por cuatrimestre */}
      <CuatrimestrePicker value={cuatri} onChange={setCuatri} />

      {/* Filtros rápidos */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            crossOrigin=""
            label="Buscar por docente / oferta / correo"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Select label="Estado" value={estado} onChange={(v) => setEstado(v)}>
            <Option value="todos">Todos</Option>
            <Option value="aceptada">Aceptada</Option>
            <Option value="rechazada">Rechazada</Option>
            <Option value="pendiente">Pendiente</Option>
          </Select>

          <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
            <Switch
              crossOrigin=""
              checked={soloNoLeidas}
              onChange={() => setSoloNoLeidas((s) => !s)}
              className="checked:bg-[#2B338C]"
            />
            <span className="text-sm">Solo no leídas</span>
          </div>

          <div className="flex items-center justify-end">
            <Button
              className="bg-[#FFDA00] text-[#2B338C]"
              onClick={() => console.log("Marcar todas como leídas (UI)")}
            >
              Marcar todas como leídas
            </Button>
          </div>
        </div>
      </Card>

      {/* Layout responsivo: lista + resumen (sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista */}
        <div className="lg:col-span-2 space-y-3">
          {items.length === 0 ? (
            <Card className="p-6">
              <Typography className="text-blue-gray-600">
                No hay notificaciones que coincidan con el filtro.
              </Typography>
            </Card>
          ) : (
            items.map((n) => <NotiItem key={n.id} item={n} />)
          )}
        </div>

        {/* Resumen lateral (en mobile también muestra los contadores) */}
        <Card className="p-4 h-fit">
          <Typography className="font-semibold mb-2">Resumen</Typography>

          {/* En mobile mostramos los chips aquí */}
          <div className="flex md:hidden items-center gap-2 mb-3">
            <Chip value={`A: ${resumen.aceptada}`} className="bg-green-600 text-white" />
            <Chip value={`R: ${resumen.rechazada}`} className="bg-red-600 text-white" />
            <Chip value={`P: ${resumen.pendiente}`} className="bg-amber-500 text-white" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Aceptadas</span>
              <Chip value={resumen.aceptada} className="bg-green-600 text-white" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Rechazadas</span>
              <Chip value={resumen.rechazada} className="bg-red-600 text-white" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pendientes</span>
              <Chip value={resumen.pendiente} className="bg-amber-500 text-white" />
            </div>
          </div>

          <div className="h-px my-3 bg-blue-gray-50" />
          <Link to="/dashboard/ofertas">
            <Button variant="outlined" className="w-full border-[#2B338C] text-[#2B338C]">
              Ir a Ofertas
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
