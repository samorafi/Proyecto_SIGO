import { useEffect, useMemo, useState } from "react";
import {
  Card, Button, Input, Select, Option, Typography, Tooltip, Dialog, DialogHeader, DialogBody, DialogFooter
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon
} from "@heroicons/react/24/outline";

const API = import.meta.env.VITE_API_BASE ?? "";
const URL = `${API}/api/auditoria`;

const syntaxHighlight = (json) => {
  if (!json) return "<span style='color:#9ca3af'>Sin datos</span>";
  try {
    if (typeof json === "string") json = JSON.parse(json);
  } catch {}
  let formatted = JSON.stringify(json, null, 2)
    .replace(/\\u([\dA-F]{4})/gi, (_, g) => String.fromCharCode(parseInt(g, 16)))
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return formatted.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let color = "#10b981";
      if (/^"/.test(match)) color = /:$/.test(match) ? "#2563eb" : "#eab308";
      else if (/true|false/.test(match)) color = "#9333ea";
      else if (/null/.test(match)) color = "#9ca3af";
      return `<span style="color:${color}">${match}</span>`;
    }
  );
};

const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}>
    {children}
  </span>
);

export default function BitacoraAuditoria() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [tabla, setTabla] = useState("Todas");
  const [accion, setAccion] = useState("Todas");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  const fetchAuditoria = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        pageSize: rowsPerPage,
        ...(search && { usuario: search }),
        ...(tabla !== "Todas" && { tabla }),
        ...(accion !== "Todas" && { accion }),
      });
      const res = await fetch(`${URL}?${params.toString()}`);
      const data = await res.json();
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error al cargar bitácora:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAuditoria(); }, [page, tabla, accion]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    return rows.filter(r =>
      String(r.usuario).toLowerCase().includes(search.toLowerCase()) ||
      String(r.descripcion).toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  const resumen = useMemo(() => ({
    total: filtered.length,
    create: filtered.filter(x => /create/i.test(x.accion)).length,
    update: filtered.filter(x => /update/i.test(x.accion)).length,
    delete: filtered.filter(x => /delete/i.test(x.accion)).length,
    post: filtered.filter(x => /post/i.test(x.accion)).length,
  }), [filtered]);

  const clearFilters = () => {
    setSearch(""); setTabla("Todas"); setAccion("Todas");
    setRowsPerPage(10); setPage(1);
  };

  return (
    <div className="p-2 md:p-6 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Bitácora de Auditoría</Typography>
          <Typography className="text-blue-gray-600">Registros del sistema</Typography>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-2 overflow-visible relative z-50">
        <div className="relative flex items-center gap-2 flex-nowrap overflow-visible py-1 px-1">
          <div className="min-w-[220px]">
            <Input size="sm" label="Buscar por usuario o descripción"
              icon={<MagnifyingGlassIcon className="h-4 w-4" />} value={search}
              onChange={(e) => setSearch(e.target.value)} crossOrigin="" />
          </div>

          <div className="min-w-[180px]">
            <Select size="sm" label="Tabla" value={tabla}
              onChange={(v) => setTabla(v || "Todas")}
              selected={() => (tabla === "Todas" ? "Todas" : tabla)}>
              <Option value="Todas">Todas</Option>
              <Option value="Cursos">Cursos</Option>
              <Option value="Usuarios">Usuarios</Option>
              <Option value="ConfSmtp">Configuración SMTP</Option>
              <Option value="Ofertas">Ofertas</Option>
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select size="sm" label="Acción" value={accion}
              onChange={(v) => setAccion(v || "Todas")}
              selected={() => (accion === "Todas" ? "Todas" : accion)}>
              <Option value="Todas">Todas</Option>
              <Option value="Create">Creación</Option>
              <Option value="Update">Actualización</Option>
              <Option value="Delete">Eliminación</Option>
              <Option value="POST">Proceso</Option>
            </Select>
          </div>

          <div className="min-w-[120px]">
            <Select size="sm" label="Filas" value={String(rowsPerPage)}
              onChange={(v) => { setRowsPerPage(Number(v || 10)); setPage(1); }}
              selected={() => String(rowsPerPage)}>
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
            </Select>
          </div>

          <div className="ml-auto">
            <Button size="sm" variant="outlined" className="border-[#2B338C] text-[#2B338C]" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      {/* Resumen */}
      <div className="flex flex-wrap gap-2">
        <Pill className="bg-[#2B338C]">TOTAL: {resumen.total}</Pill>
        <Pill className="bg-green-600">CREACIÓN: {resumen.create}</Pill>
        <Pill className="bg-blue-600">ACTUALIZACIÓN: {resumen.update}</Pill>
        <Pill className="bg-red-600">ELIMINACIÓN: {resumen.delete}</Pill>
        <Pill className="bg-amber-600">PROCESO: {resumen.post}</Pill>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden relative z-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                <th className="p-3 text-sm font-semibold">Usuario</th>
                <th className="p-3 text-sm font-semibold">Tabla</th>
                <th className="p-3 text-sm font-semibold">Acción</th>
                <th className="p-3 text-sm font-semibold">Descripción</th>
                <th className="p-3 text-sm font-semibold">Fecha</th>
                <th className="p-3 text-sm font-semibold">Ver</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-blue-gray-500">Cargando…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-blue-gray-500">Sin registros.</td></tr>
              ) : (
                filtered.map((d, i) => (
                  <tr key={d.id} className="border-b hover:bg-blue-gray-50">
                    <td className="p-3">{d.usuario}</td>
                    <td className="p-3">{d.tablaAfectada}</td>
                    <td className="p-3 font-semibold text-[#2B338C]">{d.accion}</td>
                    <td className="p-3">{d.descripcion}</td>
                    <td className="p-3">{new Date(d.fecha).toLocaleString()}</td>
                    <td className="p-3">
                      <Tooltip content="Ver detalles">
                        <Button size="sm" variant="outlined" className="border-[#2B338C] text-[#2B338C] p-2"
                          onClick={() => { setSelected(d); setOpen(true); }}>
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Tooltip>
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
            Mostrando <b>{total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, total)}</b> de <b>{total}</b>
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outlined" size="sm" className="border-[#2B338C] text-[#2B338C] px-3"
              disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm">Página <b>{page}</b> de <b>{totalPages}</b></span>
            <Button variant="outlined" size="sm" className="border-[#2B338C] text-[#2B338C] px-3"
              disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Detalles */}
      <Dialog open={open} handler={() => setOpen(false)} size="xl">
        <DialogHeader className="text-[#2B338C]">Detalles del registro</DialogHeader>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Typography variant="small" className="font-bold mb-2 text-[#2B338C] uppercase">
                Valores Anteriores
              </Typography>
              <pre className="bg-white rounded-lg p-3 border text-xs overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(selected?.valoresAnteriores) }} />
            </div>
            <div>
              <Typography variant="small" className="font-bold mb-2 text-[#2B338C] uppercase">
                Valores Nuevos
              </Typography>
              <pre className="bg-white rounded-lg p-3 border text-xs overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(selected?.valoresNuevos) }} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" className="bg-[#FFDA00] text-[#2B338C]" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
