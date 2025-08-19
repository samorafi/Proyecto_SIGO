import { useMemo, useState, useEffect } from "react";
import {
  Card, Button, Input, Select, Option, Typography, Tooltip,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

/* ------------------ MOCKS (solo UI) ------------------ */
const DATA_OFERTAS = [
  { id: 1, estado: "Publicada", sede: "San Pedro", carrera: "Ing. Sistemas", codigo: "ING-101", materia: "Prog I", grupo: "A", periodo: "I-2025", docente: "Ana Sánchez", coordinador: "Karen Rivera" },
  { id: 2, estado: "Borrador",  sede: "Virtual",   carrera: "Ing. Sistemas", codigo: "ING-250", materia: "Cisco 1", grupo: "B", periodo: "I-2025", docente: "",            coordinador: "Karen Rivera" },
  { id: 3, estado: "Cerrada",   sede: "Heredia",   carrera: "ADM",           codigo: "ADM-300", materia: "Contab", grupo: "C", periodo: "III-2024", docente: "Carlos Solís", coordinador: "Luis Mora" },
];

const DATA_DOCENTES = [
  { id: 1, nombre: "Ana Sánchez",   estado: "Activo",   categoria: "Tiempo Parcial", sede: "San Pedro", cursos: 3, asignaciones: 2 },
  { id: 2, nombre: "Carlos Solís",  estado: "Activo",   categoria: "Catedrático",    sede: "Heredia",   cursos: 4, asignaciones: 4 },
  { id: 3, nombre: "María López",   estado: "Inactivo", categoria: "Adjunto",        sede: "Virtual",   cursos: 0, asignaciones: 0 },
];

const DATA_COORDS = [
  { id: 1, nombre: "Karen Rivera", sede: "Virtual", ofertas: 12, estado: "Activo" },
  { id: 2, nombre: "Luis Mora",    sede: "Heredia", ofertas: 7,  estado: "Activo" },
  { id: 3, nombre: "Paula Rojas",  sede: "San Pedro", ofertas: 5, estado: "Activo" },
];

/* ------------------ Helpers ------------------ */
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}>
    {children}
  </span>
);

const matches = (t, q) => !q || String(t).toLowerCase().includes(q.toLowerCase());

/* ===================================================== */
export default function Reportes() {
  const [tab, setTab] = useState("ofertas");
  const [term, setTerm] = useState("");

  // Filtros compartidos (simple UI)
  const [estado, setEstado] = useState("Todos");
  const [sede, setSede] = useState("Todas");
  const [q, setQ] = useState("Todos");      // I | II | III | Todos
  const [year, setYear] = useState("Todos");

  // Paginación
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // construir dataset filtrado por tab
  const filtered = useMemo(() => {
    if (tab === "ofertas") {
      return DATA_OFERTAS.filter((o) => {
        if (!matches(`${o.carrera} ${o.materia} ${o.codigo} ${o.docente} ${o.coordinador} ${o.periodo}`, term)) return false;
        if (estado !== "Todos" && o.estado !== estado) return false;
        if (sede !== "Todas" && o.sede !== sede) return false;
        if (q !== "Todos" && !o.periodo.startsWith(q)) return false;
        if (year !== "Todos" && !o.periodo.endsWith(year)) return false;
        return true;
      });
    }
    if (tab === "docentes") {
      return DATA_DOCENTES.filter((d) => {
        if (!matches(`${d.nombre} ${d.categoria} ${d.sede}`, term)) return false;
        if (estado !== "Todos" && d.estado !== estado) return false;
        if (sede !== "Todas" && d.sede !== sede) return false;
        return true;
      });
    }
    // coordinadores
    return DATA_COORDS.filter((c) => {
      if (!matches(`${c.nombre} ${c.sede}`, term)) return false;
      if (sede !== "Todas" && c.sede !== sede) return false;
      return true;
    });
  }, [tab, term, estado, sede, q, year]);

  // chips de resumen por tab
  const chips = useMemo(() => {
    if (tab === "ofertas") {
      const publicadas = filtered.filter((x) => x.estado === "Publicada").length;
      const borrador   = filtered.filter((x) => x.estado === "Borrador").length;
      const cerradas   = filtered.filter((x) => x.estado === "Cerrada").length;
      return [
        { text: `TOTAL: ${filtered.length}`,  className: "bg-[#2B338C]" },
        { text: `PUBLICADAS: ${publicadas}`, className: "bg-green-600" },
        { text: `BORRADOR: ${borrador}`,     className: "bg-blue-gray-600" },
        { text: `CERRADAS: ${cerradas}`,     className: "bg-red-600" },
      ];
    }
    if (tab === "docentes") {
      const activos   = filtered.filter((x) => x.estado === "Activo").length;
      const inactivos = filtered.filter((x) => x.estado === "Inactivo").length;
      return [
        { text: `TOTAL: ${filtered.length}`, className: "bg-[#2B338C]" },
        { text: `ACTIVOS: ${activos}`,       className: "bg-emerald-600" },
        { text: `INACTIVOS: ${inactivos}`,   className: "bg-red-600" },
      ];
    }
    // coordinadores
    const sedes = new Set(filtered.map((x) => x.sede)).size;
    return [
      { text: `TOTAL: ${filtered.length}`, className: "bg-[#2B338C]" },
      { text: `SEDES: ${sedes}`,           className: "bg-indigo-600" },
    ];
  }, [filtered, tab]);

  // paginación
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page, rowsPerPage, total]);

  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // columnas por tab
  const HEAD =
    tab === "ofertas"
      ? [
          "Estado",
          "Sede",
          "Carrera",
          "Código",
          "Materia",
          "Grupo",
          "Periodo",
          "Docente",
          "Coordinador",
        ]
      : tab === "docentes"
      ? ["Nombre", "Estado", "Categoría", "Sede", "Cursos", "Asignaciones"]
      : ["Nombre", "Sede", "Ofertas a cargo", "Estado"];

  const clearAll = () => {
    setTerm("");
    setEstado("Todos");
    setSede("Todas");
    setQ("Todos");
    setYear("Todos");
    setRowsPerPage(10);
    setPage(1);
  };

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Reportes</Typography>
          <Typography className="text-blue-gray-600">
            Exportá información de <b>Ofertas</b>, <b>Docentes</b> y <b>Coordinadores</b>.
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="Descargar CSV (UI)">
            <Button variant="outlined" className="border-[#2B338C] text-[#2B338C] flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5" /> CSV
            </Button>
          </Tooltip>
          <Tooltip content="Exportar PDF/Imprimir (UI)">
            <Button className="bg-[#FFDA00] text-[#2B338C] flex items-center gap-2">
              <PrinterIcon className="h-5 w-5" /> PDF
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Tabs simples */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { k: "ofertas", label: "Ofertas" },
          { k: "docentes", label: "Docentes" },
          { k: "coordinadores", label: "Coordinadores" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => { setTab(t.k); setPage(1); }}
            className={`rounded-lg px-4 py-2 font-semibold transition
              ${tab === t.k ? "bg-[#2B338C] text-white shadow-md" : "bg-white text-[#2B338C] border"}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <Input
            crossOrigin=""
            label={
              tab === "ofertas"
                ? "Buscar (código, materia, docente)"
                : tab === "docentes"
                ? "Buscar (nombre, categoría)"
                : "Buscar (nombre, sede)"
            }
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />

          {/* Estado (en Ofertas y Docentes) */}
          {(tab === "ofertas" || tab === "docentes") && (
            <Select label="Estado" value={estado} onChange={setEstado}>
              <Option value="Todos">Todos</Option>
              {tab === "ofertas" ? (
                <>
                  <Option value="Publicada">Publicada</Option>
                  <Option value="Borrador">Borrador</Option>
                  <Option value="Cerrada">Cerrada</Option>
                </>
              ) : (
                <>
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                  <Option value="Suspendido">Suspendido</Option>
                </>
              )}
            </Select>
          )}

          {/* Sede (en todos) */}
          <Select label="Sede" value={sede} onChange={setSede}>
            <Option value="Todas">Todas</Option>
            <Option value="San Pedro">San Pedro</Option>
            <Option value="Heredia">Heredia</Option>
            <Option value="Virtual">Virtual</Option>
          </Select>

          {/* Cuatrimestre (solo Ofertas) */}
          {tab === "ofertas" && (
            <>
              <Select label="Cuatrimestre" value={q} onChange={setQ}>
                <Option value="Todos">Todos</Option>
                <Option value="I">I</Option>
                <Option value="II">II</Option>
                <Option value="III">III</Option>
              </Select>
              <Select label="Año" value={year} onChange={setYear}>
                <Option value="Todos">Todos</Option>
                <Option value="2025">2025</Option>
                <Option value="2024">2024</Option>
              </Select>
            </>
          )}

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

          <div className="flex items-center justify-end">
            <Button variant="outlined" className="border-[#2B338C] text-[#2B338C]" onClick={clearAll}>
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Chips resumen */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c, i) => (
          <Pill key={i} className={c.className}>{c.text}</Pill>
        ))}
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                {HEAD.map((h) => (
                  <th key={h} className="p-3 text-sm font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={HEAD.length} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : tab === "ofertas" ? (
                pageData.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="p-3">{o.estado}</td>
                    <td className="p-3">{o.sede}</td>
                    <td className="p-3">{o.carrera}</td>
                    <td className="p-3">{o.codigo}</td>
                    <td className="p-3">{o.materia}</td>
                    <td className="p-3">{o.grupo}</td>
                    <td className="p-3">{o.periodo}</td>
                    <td className="p-3">{o.docente || <span className="text-blue-gray-400">Sin asignar</span>}</td>
                    <td className="p-3">{o.coordinador}</td>
                  </tr>
                ))
              ) : tab === "docentes" ? (
                pageData.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="p-3">{d.nombre}</td>
                    <td className="p-3">{d.estado}</td>
                    <td className="p-3">{d.categoria}</td>
                    <td className="p-3">{d.sede}</td>
                    <td className="p-3">{d.cursos}</td>
                    <td className="p-3">{d.asignaciones}</td>
                  </tr>
                ))
              ) : (
                pageData.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">{c.nombre}</td>
                    <td className="p-3">{c.sede}</td>
                    <td className="p-3">{c.ofertas}</td>
                    <td className="p-3">{c.estado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación abajo */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3">
          <span className="text-sm text-blue-gray-600">
            Mostrando{" "}
            <b>{total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, total)}</b>{" "}
            de <b>{total}</b>
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outlined" size="sm"
              className="border-[#2B338C] text-[#2B338C] px-3"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm">Página <b>{page}</b> de <b>{totalPages}</b></span>
            <Button
              variant="outlined" size="sm"
              className="border-[#2B338C] text-[#2B338C] px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
