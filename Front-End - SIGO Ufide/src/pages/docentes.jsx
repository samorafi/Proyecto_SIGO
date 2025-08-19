import { useEffect, useMemo, useState } from "react";
import {
  Card, Button, Input, Select, Option, Typography,
  Tooltip, Dialog, DialogHeader, DialogBody, DialogFooter,
  Avatar, Switch,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, EyeIcon, PencilSquareIcon, TrashIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from "@heroicons/react/24/outline";

/* ===================== MOCK (solo UI) ===================== */
const DOCENTES = [
  {
    id: 1,
    nombre: "Ana Sánchez",
    cedula: "1-1234-5678",
    genero: "F",
    correo: "ana.sanchez@ufide.ac.cr",
    telefono: "8888-0001",
    domicilio: { provincia: "San José", canton: "Montes de Oca" },
    categoria: "Tiempo Parcial",
    estado: "Activo",
    ingreso: "2019-02-10",
    contratacion: "Servicios profesionales",
    atestados: "MSc. Informática",
    sede: "San Pedro",
    motivoDesv: "",
    cuatriDesv: "",
    comentarios: "Imparte Programación I y II",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: 2,
    nombre: "Carlos Solís",
    cedula: "2-2345-6789",
    genero: "M",
    correo: "carlos.solis@ufide.ac.cr",
    telefono: "8888-0002",
    domicilio: { provincia: "Heredia", canton: "Santo Domingo" },
    categoria: "Catedrático",
    estado: "Activo",
    ingreso: "2016-08-01",
    contratacion: "Nombramiento",
    atestados: "Ing. Sistemas, Cisco CCNA",
    sede: "Heredia",
    motivoDesv: "",
    cuatriDesv: "",
    comentarios: "Coordinador de networking",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 3,
    nombre: "María López",
    cedula: "3-3456-7890",
    genero: "F",
    correo: "maria.lopez@ufide.ac.cr",
    telefono: "8888-0003",
    domicilio: { provincia: "Alajuela", canton: "Central" },
    categoria: "Adjunto",
    estado: "Inactivo",
    ingreso: "2018-03-20",
    contratacion: "Servicios profesionales",
    atestados: "Lic. Educación",
    sede: "Virtual",
    motivoDesv: "Fin de contrato",
    cuatriDesv: "III-2024",
    comentarios: "Pendiente liquidación",
    avatar: "https://i.pravatar.cc/100?img=48",
  },
];

/* Helpers */
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}>
    {children}
  </span>
);
const EstadoChip = ({ estado }) => {
  const map = { Activo: "bg-green-600", Inactivo: "bg-red-600", Suspendido: "bg-amber-600" };
  return <Pill className={map[estado] || "bg-blue-gray-600"}>{estado?.toUpperCase()}</Pill>;
};
const matches = (t, q) => !q || String(t).toLowerCase().includes(q.toLowerCase());

function DocenteDialog({ open, onClose, docente }) {
  return (
    <Dialog
      open={open}
      handler={onClose}
      animate={{ mount: { opacity: 1, scale: 1, y: 0 }, unmount: { opacity: 0, scale: 1, y: 0 } }}
    >
      <DialogHeader className="text-[#2B338C]">Ficha del docente</DialogHeader>
      <DialogBody>
        {docente ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={docente.avatar} alt={docente.nombre} size="lg" />
              <div>
                <p className="font-semibold text-lg">{docente.nombre}</p>
                <p className="text-sm text-blue-gray-600">{docente.correo}</p>
                <p className="text-sm text-blue-gray-600">{docente.telefono}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Info label="Cédula" value={docente.cedula} />
              <Info label="Género" value={docente.genero} />
              <Info label="Categoría" value={docente.categoria} />
              <Info label="Estado" value={<EstadoChip estado={docente.estado} />} />
              <Info label="Ingreso" value={docente.ingreso} />
              <Info label="Contratación" value={docente.contratacion} />
              <Info label="Atestados" value={docente.atestados} />
              <Info label="Sede" value={docente.sede} />
              <Info label="Domicilio" value={`${docente.domicilio?.provincia ?? ""}, ${docente.domicilio?.canton ?? ""}`} />
              <Info label="Motivo de desvinculación" value={docente.motivoDesv || "—"} />
              <Info label="Cuatrimestre de desvinculación" value={docente.cuatriDesv || "—"} />
              <Info label="Comentarios" value={docente.comentarios || "—"} />
            </div>
          </div>
        ) : (
          <p className="text-blue-gray-600">No hay datos disponibles.</p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" className="bg-[#FFDA00] text-[#2B338C] mr-2" onClick={onClose}>Cerrar</Button>
      </DialogFooter>
    </Dialog>
  );
}
function Info({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-blue-gray-500">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  );
}

/* ===================== Página ===================== */
export default function Docentes() {
  const [term, setTerm] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [categoria, setCategoria] = useState("Todas");
  const [genero, setGenero] = useState("Todos");
  const [sede, setSede] = useState("Todas");
  const [showExtra, setShowExtra] = useState(false);

  // paginación: selector ARRIBA (filtros), footer abajo
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // dialog
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState(null);

  const filtered = useMemo(() => {
    return DOCENTES.filter((d) => {
      if (!matches(`${d.nombre} ${d.cedula} ${d.correo} ${d.telefono} ${d.categoria} ${d.sede}`, term)) return false;
      if (estado !== "Todos" && d.estado !== estado) return false;
      if (categoria !== "Todas" && d.categoria !== categoria) return false;
      if (genero !== "Todos" && d.genero !== genero) return false;
      if (sede !== "Todas" && d.sede !== sede) return false;
      return true;
    });
  }, [term, estado, categoria, genero, sede]);

  // totales para chips
  const total = filtered.length;
  const activos = filtered.filter((d) => d.estado === "Activo").length;
  const inactivos = filtered.filter((d) => d.estado === "Inactivo").length;

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page, rowsPerPage, total]);

  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // columnas visibles
  const HEAD_BASE = [
    { key: "nombre", label: "Nombre" },
    { key: "cedula", label: "Cédula" },
    { key: "genero", label: "Género" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "categoria", label: "Categoría" },
    { key: "estado", label: "Estado" },
    { key: "sede", label: "Sede" },
  ];
  const HEAD_EXTRA = [
    { key: "ingreso", label: "Ingreso" },
    { key: "contratacion", label: "Contratación" },
    { key: "atestados", label: "Atestados" },
  ];
  const HEAD = showExtra ? [...HEAD_BASE, ...HEAD_EXTRA] : HEAD_BASE;

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Docentes</Typography>
          <Typography className="text-blue-gray-600">Gestión y consulta de docentes.</Typography>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <Input
            crossOrigin=""
            label="Buscar (nombre, cédula, correo)"
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Select label="Estado" value={estado} onChange={setEstado}>
            <Option value="Todos">Todos</Option>
            <Option value="Activo">Activo</Option>
            <Option value="Inactivo">Inactivo</Option>
            <Option value="Suspendido">Suspendido</Option>
          </Select>
          <Select label="Categoría" value={categoria} onChange={setCategoria}>
            <Option value="Todas">Todas</Option>
            <Option value="Catedrático">Catedrático</Option>
            <Option value="Adjunto">Adjunto</Option>
            <Option value="Tiempo Parcial">Tiempo Parcial</Option>
          </Select>
          <Select label="Género" value={genero} onChange={setGenero}>
            <Option value="Todos">Todos</Option>
            <Option value="F">F</Option>
            <Option value="M">M</Option>
          </Select>
          <Select label="Sede" value={sede} onChange={setSede}>
            <Option value="Todas">Todas</Option>
            <Option value="San Pedro">San Pedro</Option>
            <Option value="Heredia">Heredia</Option>
            <Option value="Virtual">Virtual</Option>
          </Select>

          {/* Filas por página (arriba) */}
          <Select
            label="Filas por página"
            value={String(rowsPerPage)}
            onChange={(v) => setRowsPerPage(Number(v))}
            containerProps={{ className: "min-w-[140px]" }}
          >
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
          </Select>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <Button
              variant="outlined"
              className="border-[#2B338C] text-[#2B338C]"
              onClick={() => {
                setTerm(""); setEstado("Todos"); setCategoria("Todas");
                setGenero("Todos"); setSede("Todas"); setShowExtra(false);
                setRowsPerPage(10); setPage(1);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Resumen */}
      <div className="flex flex-wrap gap-2">
        <Pill className="bg-[#2B338C]">TOTAL: {total}</Pill>
        <Pill className="bg-green-600">ACTIVOS: {activos}</Pill>
        <Pill className="bg-red-600">INACTIVOS: {inactivos}</Pill>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                {HEAD.map((h) => (
                  <th key={h.key} className="p-3 text-sm font-semibold">{h.label}</th>
                ))}
                <th className="p-3 text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={HEAD.length + 1} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : (
                pageData.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={d.avatar} alt={d.nombre} size="sm" />
                        <span className="truncate max-w-[200px]">{d.nombre}</span>
                      </div>
                    </td>
                    <td className="p-3">{d.cedula}</td>
                    <td className="p-3">{d.genero}</td>
                    <td className="p-3">{d.correo}</td>
                    <td className="p-3">{d.telefono}</td>
                    <td className="p-3">{d.categoria}</td>
                    <td className="p-3"><EstadoChip estado={d.estado} /></td>
                    <td className="p-3">{d.sede}</td>

                    {showExtra && (
                      <>
                        <td className="p-3">{d.ingreso}</td>
                        <td className="p-3">{d.contratacion}</td>
                        <td className="p-3">{d.atestados}</td>
                      </>
                    )}

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Ver ficha">
                          <Button
                            size="sm"
                            variant="outlined"
                            className="border-[#2B338C] text-[#2B338C] p-2"
                            onClick={() => { setRow(d); setOpen(true); }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Editar">
                          <Button size="sm" className="bg-[#FFDA00] text-[#2B338C] p-2">
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                          <Button size="sm" variant="outlined" className="border-red-500 text-red-600 p-2">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación ABAJO */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3">
          <span className="text-sm text-blue-gray-600">
            Mostrando{" "}
            <b>{total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, total)}</b>{" "}
            de <b>{total}</b>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outlined"
              size="sm"
              className="border-[#2B338C] text-[#2B338C] px-3"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm">
              Página <b>{page}</b> de <b>{totalPages}</b>
            </span>
            <Button
              variant="outlined"
              size="sm"
              className="border-[#2B338C] text-[#2B338C] px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <DocenteDialog open={open} onClose={() => setOpen(false)} docente={row} />
    </div>
  );
}
