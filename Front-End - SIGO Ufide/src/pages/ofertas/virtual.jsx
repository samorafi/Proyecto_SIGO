import { useEffect, useMemo, useState } from "react";
import {
  Card, Button, Input, Select, Option, Typography,
  Tooltip, Dialog, DialogHeader, DialogBody, DialogFooter, Avatar,
} from "@material-tailwind/react";
import {
  PlusIcon, MagnifyingGlassIcon, EyeIcon,
  PencilSquareIcon, TrashIcon, PaperAirplaneIcon,
  ArrowUpTrayIcon, ChevronLeftIcon, ChevronRightIcon,
} from "@heroicons/react/24/outline";
import OfertasTabs from "./OfertasTabs";
import CuatrimestrePicker from "@/components/CuatrimestrePicker";

/* ------------------------ MOCK (solo UI) ------------------------ */
const VIRTUAL = [
  {
    id: 101,
    estado: "Publicada",
    grado: "Bach.",
    carrera: "Ing. Sistemas",
    sede: "FideVirtual",
    periodo: "1Q-2025",
    codigo: "ING-250",
    materia: "Cisco Networking 1",
    grupo: "A",
    dia: "Mi",
    horario: "18:00-19:30",
    matricula: 32,
    docente: {
      nombre: "Carlos Solís",
      correo: "carlos.solis@ufide.ac.cr",
      celular: "8888-0000",
      avatar: "https://i.pravatar.cc/100?img=15",
    },
    coordinadorInfo: {
      nombre: "Karen Rivera",
      correo: "krivera@ufide.ac.cr",
      celular: "7000-0000",
      avatar: "https://i.pravatar.cc/100?img=31",
    },
    cuatriIngreso: "I-2025",
  },
  {
    id: 102,
    estado: "Borrador",
    grado: "Lic.",
    carrera: "Ing. Sistemas",
    sede: "FideVirtual",
    periodo: "2Q-2025",
    codigo: "ING-360",
    materia: "Seguridad de Redes",
    grupo: "B",
    dia: "J",
    horario: "19:00-20:40",
    matricula: 18,
    docente: null,
    coordinadorInfo: {
      nombre: "Karen Rivera",
      correo: "krivera@ufide.ac.cr",
      celular: "7000-0000",
      avatar: "https://i.pravatar.cc/100?img=31",
    },
    cuatriIngreso: "II-2025",
  },
];

/* ---------- Encabezados (mismos que Presencial) ---------- */
const HEAD_VIRT = [
  { key: "grado", label: "Grado" },
  { key: "carrera", label: "Carrera" },
  { key: "sede", label: "Sede" },
  { key: "periodo", label: "Periodo" },
  { key: "codigo", label: "Código" },
  { key: "materia", label: "Materia" },
  { key: "grupo", label: "Grupo" },
  { key: "dia", label: "Día" },
  { key: "horario", label: "Horario" },
  { key: "matricula", label: "Matrícula" },
  { key: "docente", label: "Docente" },
  { key: "coordinadorInfo", label: "Coordinador" },
  { key: "cuatriIngreso", label: "Cuatrimestre de Ingreso" },
];

const matches = (t, q) => !q || String(t).toLowerCase().includes(q.toLowerCase());

/* ---------- Pill simple (chips sólidos) ---------- */
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}>
    {children}
  </span>
);

/* ---------- Dialog genérico súper rápido ---------- */
function PersonDialog({ open, onClose, title, person }) {
  return (
    <Dialog
      open={open}
      handler={onClose}
      animate={{
        mount: { opacity: 1, scale: 1, y: 0 },
        unmount: { opacity: 0, scale: 1, y: 0 },
      }}
    >
      <DialogHeader className="text-[#2B338C]">{title}</DialogHeader>
      <DialogBody>
        {person ? (
          <div className="flex items-center gap-4">
            <Avatar src={person.avatar} alt="persona" size="lg" />
            <div>
              <p className="font-semibold">{person.nombre}</p>
              {person.correo && <p className="text-sm text-blue-gray-600">{person.correo}</p>}
              {person.celular && <p className="text-sm text-blue-gray-600">{person.celular}</p>}
            </div>
          </div>
        ) : (
          <p className="text-blue-gray-600">No hay datos disponibles.</p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" className="mr-2" onClick={onClose}>
          Cerrar
        </Button>
        <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={onClose}>
          Ver perfil
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default function OfertasVirtual() {
  const [term, setTerm] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [dia, setDia] = useState("Todos");
  const [cuatri, setCuatri] = useState({ q: "Todos", year: "Todos" });

  // Import (UI)
  const [importName, setImportName] = useState("");

  // Dialogs
  const [openDoc, setOpenDoc] = useState(false);
  const [openCoord, setOpenCoord] = useState(false);
  const [person, setPerson] = useState(null);

  // Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    return VIRTUAL.filter((o) => {
      if (!matches(`${o.grado} ${o.carrera} ${o.codigo} ${o.materia} ${o.docente?.nombre ?? ""}`, term)) return false;
      if (estado !== "Todos" && o.estado !== estado) return false;
      if (dia !== "Todos" && o.dia !== dia) return false;
      if (cuatri.q !== "Todos" && !String(o.periodo).includes(cuatri.q)) return false;
      if (cuatri.year !== "Todos" && !String(o.periodo).includes(cuatri.year)) return false;
      return true;
    });
  }, [term, estado, dia, cuatri]);

  const total = filtered.length;
  const publicadas = filtered.filter((o) => o.estado === "Publicada").length;
  const borradores = filtered.filter((o) => o.estado === "Borrador").length;
  const cerradas = filtered.filter((o) => o.estado === "Cerrada").length;

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Ofertas</Typography>
        <Typography className="text-blue-gray-600">Virtual</Typography>
        </div>

        <div className="flex items-center gap-2">
          {/* Importar (UI) */}
          <input
            id="import-virtual"
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setImportName(file ? file.name : "");
            }}
          />
          <label htmlFor="import-virtual">
            <Tooltip content="Importar desde CSV o Excel">
              <Button variant="outlined" className="border-[#2B338C] text-[#2B338C] flex items-center gap-2">
                <ArrowUpTrayIcon className="h-5 w-5" />
                Importar
              </Button>
            </Tooltip>
          </label>
          {importName && (
            <span className="text-xs text-blue-gray-600 truncate max-w-[180px]">{importName}</span>
          )}

          <Button className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2">
            <PlusIcon className="h-5 w-5" /> Nueva oferta
          </Button>
        </div>
      </div>

      <OfertasTabs />

      <CuatrimestrePicker value={cuatri} onChange={setCuatri} />

      {/* Filtros (sin Sede) */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            crossOrigin=""
            label="Buscar (código, materia, docente)"
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Select label="Estado" value={estado} onChange={setEstado}>
            <Option value="Todos">Todos</Option>
            <Option value="Publicada">Publicada</Option>
            <Option value="Borrador">Borrador</Option>
            <Option value="Cerrada">Cerrada</Option>
          </Select>
          <Select label="Día" value={dia} onChange={setDia}>
            <Option value="Todos">Todos</Option>
            <Option>L</Option><Option>M</Option><Option>Mi</Option>
            <Option>J</Option><Option>V</Option><Option>S</Option>
          </Select>
          <Select label="Filas por página" value={rowsPerPage} onChange={(v)=>setRowsPerPage(Number(v))}>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
            <Option value={50}>50</Option>
          </Select>
          <div className="flex items-center justify-end">
            <Button
              variant="outlined"
              className="border-[#2B338C] text-[#2B338C]"
              onClick={() => {
                setTerm(""); setEstado("Todos"); setDia("Todos");
                setCuatri({ q: "Todos", year: "Todos" }); setImportName(""); setPage(1);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Resumen (pills sólidos) */}
      <div className="flex flex-wrap gap-2">
        <Pill className="bg-[#2B338C]">TOTAL: {total}</Pill>
        <Pill className="bg-green-600">PUBLICADAS: {publicadas}</Pill>
        <Pill className="bg-blue-gray-600">BORRADOR: {borradores}</Pill>
        <Pill className="bg-red-600">CERRADAS: {cerradas}</Pill>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                {HEAD_VIRT.map((h) => (
                  <th key={h.key} className="p-3 text-sm font-semibold">{h.label}</th>
                ))}
                <th className="p-3 text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={HEAD_VIRT.length + 1} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : (
                pageData.map((o) => (
                  <tr key={o.id} className="border-b">
                    {/* columnas simples */}
                    <td className="p-3">{o.grado}</td>
                    <td className="p-3">{o.carrera}</td>
                    <td className="p-3">{o.sede}</td>
                    <td className="p-3">{o.periodo}</td>
                    <td className="p-3">{o.codigo}</td>
                    <td className="p-3">{o.materia}</td>
                    <td className="p-3">{o.grupo}</td>
                    <td className="p-3">{o.dia}</td>
                    <td className="p-3">{o.horario}</td>
                    <td className="p-3">{o.matricula}</td>

                    {/* Docente: nombre + botón Ver */}
                    <td className="p-3">
                      {o.docente ? (
                        <div className="flex items-center gap-2">
                          <Avatar src={o.docente.avatar} alt={o.docente.nombre} size="sm" />
                          <span className="truncate max-w-[160px]">{o.docente.nombre}</span>
                          <Tooltip content="Ver datos del docente">
                            <Button
                              size="sm"
                              variant="text"
                              className="text-[#2B338C] p-1"
                              onClick={() => { setPerson(o.docente); setOpenDoc(true); }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      ) : (
                        <Pill className="bg-blue-gray-400">SIN ASIGNAR</Pill>
                      )}
                    </td>

                    {/* Coordinador: nombre + botón Ver */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={o.coordinadorInfo.avatar} alt={o.coordinadorInfo.nombre} size="sm" />
                        <span className="truncate max-w-[160px]">{o.coordinadorInfo.nombre}</span>
                        <Tooltip content="Ver datos del coordinador">
                          <Button
                            size="sm"
                            variant="text"
                            className="text-[#2B338C] p-1"
                            onClick={() => { setPerson(o.coordinadorInfo); setOpenCoord(true); }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>

                    <td className="p-3">{o.cuatriIngreso}</td>

                    {/* Acciones */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Ver detalle">
                          <Button size="sm" variant="outlined" className="border-[#2B338C] text-[#2B338C] p-2">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Editar oferta">
                          <Button size="sm" className="bg-[#FFDA00] text-[#2B338C] p-2">
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar oferta">
                          <Button size="sm" variant="outlined" className="border-red-500 text-red-600 p-2">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Enviar a docente">
                          <Button size="sm" variant="outlined" className="border-green-600 text-green-700 p-2">
                            <PaperAirplaneIcon className="h-4 w-4" />
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

        {/* Paginación */}
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

      {/* Dialogs rápidos */}
      <PersonDialog
        open={openDoc}
        onClose={() => setOpenDoc(false)}
        title="Datos del docente"
        person={person}
      />
      <PersonDialog
        open={openCoord}
        onClose={() => setOpenCoord(false)}
        title="Datos del coordinador"
        person={person}
      />
    </div>
  );
}
