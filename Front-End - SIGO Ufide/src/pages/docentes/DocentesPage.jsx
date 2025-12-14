// src/pages/docentes/DocentesPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Card, Button, Input, Select, Option, Typography, Tooltip,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, EyeIcon, PencilSquareIcon,
  ChevronLeftIcon, ChevronRightIcon, PlusIcon,
} from "@heroicons/react/24/outline";

import { FormButton } from "@/components/ui/Buttons";


import {
  FichaDocente,
  AgregarDocente,
  EditarDocente,
} from "./DocentesDialogs.jsx";

/* ===================== API CONFIG ===================== */
const API = import.meta.env.VITE_API_BASE ?? "";
const URL = {
  personas: `${API}/api/personas`,
  personaById: (id) => `${API}/api/personas/${id}`,
  generos: `${API}/api/generos`,
  provincias: `${API}/api/provincias`,
  cantones: (provinciaId) => `${API}/api/cantones?provinciaId=${provinciaId}`,
  categorias: `${API}/api/categoriadocentes`,
  estados: `${API}/api/estadospersona`,
  tiposContrato: `${API}/api/tiposcontrato`,
  atestados: `${API}/api/atestados`,
  roles: `${API}/api/rol-docentes`,
  motivos: `${API}/api/motivosdesvinculacion`,
  periodos: `${API}/api/periodos`,
  sedes: `${API}/api/sedes`,
};

/* ===================== HELPERS ===================== */
async function fetchArray(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  const txt = await r.text();
  if (!txt) return [];
  let j; try { j = JSON.parse(txt); } catch { return []; }
  let arr = Array.isArray(j) ? j : (j.data ?? j.items ?? j.result ?? j.results ?? []);
  if (!Array.isArray(arr)) arr = [];
  return arr.map(x => ({
    id: String(
      x.id ?? x.Id ?? x.ID ?? x.valor ?? x.value ??
      x.generoId ?? x.provinciaId ?? x.cantonId ?? x.categoriaId ??
      x.estadoPersonaId ?? x.tipoContratoId ?? x.atestadoId ?? x.rolDocenteId ??
      x.rolId ??
      x.motivoDesvinculacionId ?? x.periodoDesvinculacionId ?? x.sedeId ??
      x.periodoIngresoId
    ),
    nombre: String(
      x.nombre ?? x.Nombre ?? x.descripcion ?? x.label ??
      x.genero ?? x.provincia ?? x.canton ?? x.categoria ??
      x.estado ?? x.tipoContrato ?? x.atestado ?? x.rol ?? x.rolDocente ??
      x.motivo ?? x.periodo ?? x.sede
    ),
    __raw: x
  }));
}

const matches = (t, q) =>
  !q || String(t ?? "").toLowerCase().includes(String(q ?? "").toLowerCase());


const buildPeriodoLabel = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x;

  const etiqueta =
    x.etiqueta ??
    x.Etiqueta ??
    x.label ??
    x.nombre ??
    x.Nombre ??
    x.descripcion ??
    x.periodo;

  if (etiqueta) return String(etiqueta);

  const numero = x.numero ?? x.Numero ?? x.num ?? x.Num;
  const tipo = x.tipo ?? x.Tipo ?? "";
  const anio = x.anio ?? x.Anio ?? x.anioAcademico ?? x.year;

  const numTipo = [numero, tipo].filter(Boolean).join("");

  if (numTipo && anio) return `${numTipo}, ${anio}`;
  if (anio) return String(anio);
  if (numTipo) return numTipo;

  return "";
};


async function fetchPeriodosOrdered() {
  const url = URL.periodos;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  const txt = await r.text();
  if (!txt) return [];
  let j; try { j = JSON.parse(txt); } catch { return []; }

  let arr = Array.isArray(j)
    ? j
    : (j.data ?? j.items ?? j.result ?? j.results ?? []);

  if (!Array.isArray(arr)) arr = [];


  arr.sort((a, b) => {
    const aId = Number(a.periodoId ?? a.id ?? a.Id ?? a.ID ?? 0);
    const bId = Number(b.periodoId ?? b.id ?? b.Id ?? b.ID ?? 0);
    return bId - aId;
  });

  return arr.map(x => ({
    id: String(x.periodoId ?? x.id ?? x.Id ?? x.ID),
    nombre: buildPeriodoLabel(x),
    __raw: x,
  }));
}


/* Z-index/menu fixes */
const MENU_CLS =
  "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";
const Field = ({ children }) => (
  <div className="relative z-0 focus-within:z-[500]">{children}</div>
);

/* ===================== Chips ===================== */
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}>
    {children}
  </span>
);
const EstadoChip = ({ value }) => {
  const v = String(value ?? "").toLowerCase();
  const map = { activo: "bg-green-600", inactivo: "bg-red-600", suspendido: "bg-amber-600" };
  return <Pill className={map[v] || "bg-blue-gray-600"}>{(v || "—").toUpperCase()}</Pill>;
};

/* ===================== VISTA GENERAL ===================== */
function Docentes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  // Filtros
  const [q, setQ] = useState("");
  const [fAtestado, setFAtestado] = useState("Todos");
  const [fCategoria, setFCategoria] = useState("Todas");
  const [fEstado, setFEstado] = useState("Todos");
  const [fTipoContrato, setFTipoContrato] = useState("Todos");

  // Catálogos
  const [cats, setCats] = useState({
    categorias: [],
    estados: [],
    tiposContrato: [],
    atestados: [],
    periodos: [],
  });
  const [provMap, setProvMap] = useState({});
  const [periodoMap, setPeriodoMap] = useState({});

  // Paginación
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // Para priorizar último agregado/editado
  const [lastTouchedId, setLastTouchedId] = useState(null);

  // Modales
  const [openAdd, setOpenAdd] = useState(false);
  const [openFicha, setOpenFicha] = useState(false);
  const [fichaId, setFichaId] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const loadCats = async () => {
    try {
      const [pp, cc, ee, tt, aa, per] = await Promise.all([
        fetchArray(URL.provincias),
        fetchArray(URL.categorias),
        fetchArray(URL.estados),
        fetchArray(URL.tiposContrato),
        fetchArray(URL.atestados),
        fetchPeriodosOrdered(),
      ]);

      setCats({
        categorias: cc,
        estados: ee,
        tiposContrato: tt,
        atestados: aa,
        periodos: per,
      });

      const m = {};
      pp.forEach(p => { m[String(p.id)] = p.nombre; });
      setProvMap(m);

      const pm = {};
      per.forEach(p => { pm[String(p.id)] = p.nombre; });
      setPeriodoMap(pm);
    } catch (e) {
      console.error("Error catálogos:", e);
    }
  };

  const loadRows = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(URL.personas);
      if (!r.ok) throw new Error("GET personas");
      const json = await r.json();
      const arr = Array.isArray(json)
        ? json
        : (json.data ?? json.items ?? json.result ?? json.results ?? []);
      const safe = Array.isArray(arr) ? arr : [];

      const provById = provMap || {};
      const catById = Object.fromEntries((cats?.categorias ?? []).map(c => [String(c.id), c.nombre]));
      const contratoById = Object.fromEntries((cats?.tiposContrato ?? []).map(t => [String(t.id), t.nombre]));
      const atestadoById = Object.fromEntries((cats?.atestados ?? []).map(a => [String(a.id), a.nombre]));
      const perById = Object.keys(periodoMap).length
        ? periodoMap
        : Object.fromEntries((cats?.periodos ?? []).map(p => [String(p.id), p.nombre]));

      let mapped = safe.map(x => {
        const provinciaId = x.provinciaId ?? x?.provincia?.id ?? null;
        const provinciaNombre =
          x.provinciaNombre ?? x?.provincia?.nombre ?? x.provincia ??
          (provinciaId != null ? provById[String(provinciaId)] ?? "" : "");

        const categoriaId = x.categoriaId ?? x?.categoria?.id ?? null;
        const categoriaNombre =
          x.categoriaNombre ?? x?.categoria?.nombre ?? x.categoria ??
          (categoriaId != null ? catById[String(categoriaId)] ?? "" : "");

        const tipoContratoId = x.tipoContratoId ?? x?.tipoContrato?.id ?? null;
        const tipoContratoNombre =
          x.tipoContratoNombre ?? x?.tipoContrato?.nombre ?? x.tipoContrato ??
          (tipoContratoId != null ? contratoById[String(tipoContratoId)] ?? "" : "");

        const atestadoId = x.atestadoId ?? x?.atestado?.id ?? null;
        const atestadoNombre =
          x.atestadoNombre ?? x?.atestado?.nombre ?? x.atestado ??
          (atestadoId != null ? atestadoById[String(atestadoId)] ?? "" : "");

        const estadoNombre =
          (typeof x.estado === "boolean")
            ? (x.estado ? "Activo" : "Inactivo")
            : (x.estadoNombre ?? x?.estado ?? x?.estadoPersona?.nombre ?? "");

        const periodoIngresoId =
          x.periodoIngresoId ??
          x?.periodoIngreso?.id ??
          x?.periodoIngreso?.periodoId ??
          null;

        const periodoIngresoNombre =
          x?.periodoIngreso?.nombre ??
          x?.periodoIngreso ??
          (periodoIngresoId != null ? perById[String(periodoIngresoId)] ?? "" : "");


        return {
          id: x.id ?? x.personaId,
          nombre: x.nombre ?? x.nombreCompleto,
          primerApellido: x.primerApellido ?? "",
          segundoApellido: x.segundoApellido ?? "",
          cedula: x.cedula ?? x.identificacion,
          correo: x.correo ?? x.email,
          telefono: x.telefono ?? x.celular,
          provincia: provinciaNombre,
          categoria: categoriaNombre,
          tipoContrato: tipoContratoNombre,
          atestado: atestadoNombre,
          estado: estadoNombre,
          periodoIngreso: periodoIngresoNombre,
        };
      });

      if (lastTouchedId != null) {
        const lid = String(lastTouchedId);
        mapped.sort((a, b) => {
          if (String(a.id) === lid) return -1;
          if (String(b.id) === lid) return 1;
          return 0;
        });
      }

      setRows(mapped);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los docentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCats(); }, []);
  useEffect(() => {
    loadRows();
  }, [
    Object.keys(provMap).length,
    (cats?.categorias ?? []).length,
    (cats?.tiposContrato ?? []).length,
    (cats?.atestados ?? []).length,
    (cats?.periodos ?? []).length,
    lastTouchedId,
  ]);

  const filtered = useMemo(() => {
    try {
      return rows.filter(r => {
        if (!matches(
          `${r.nombre} ${r.primerApellido} ${r.segundoApellido} ${r.cedula} ${r.correo} ${r.telefono} ${r.categoria} ${r.tipoContrato} ${r.provincia} ${r.atestado} ${r.periodoIngreso}`,
          q
        )) return false;
        if (fAtestado !== "Todos" && r.atestado !== fAtestado) return false;
        if (fCategoria !== "Todas" && r.categoria !== fCategoria) return false;
        if (fEstado !== "Todos" && String(r.estado).toLowerCase() !== String(fEstado).toLowerCase()) return false;
        if (fTipoContrato !== "Todos" && r.tipoContrato !== fTipoContrato) return false;
        return true;
      });
    } catch {
      return rows;
    }
  }, [rows, q, fAtestado, fCategoria, fEstado, fTipoContrato]);

  const total = filtered.length;
  const activos = filtered.filter(x => String(x.estado).toLowerCase() === "activo").length;
  const inactivos = filtered.filter(x => String(x.estado).toLowerCase() === "inactivo").length;

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const clearFilters = () => {
    setQ("");
    setFAtestado("Todos");
    setFCategoria("Todas");
    setFEstado("Todos");
    setFTipoContrato("Todos");
    setRowsPerPage(10);
    setPage(1);
  };

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Docentes</Typography>
          <Typography className="text-blue-gray-600">Vista general</Typography>
        </div>
        <FormButton onClick={() => setOpenAdd(true)} >Agregar docente</FormButton>
      </div>

      {/* Filtros */}
      <Card className="p-2 overflow-visible relative z-50">
        <div className="relative flex items-center gap-2 flex-nowrap overflow-visible py-1 px-1">
          <div className="min-w-[220px]">
            <Input
              size="sm"
              crossOrigin=""
              label="Buscar…"
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="min-w-[180px]">
            <Select
              size="sm"
              label="Atestado"
              value={fAtestado}
              onChange={(v) => setFAtestado(v || "Todos")}
              selected={() => (fAtestado === "Todos" ? "Todos" : fAtestado)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todos">Todos</Option>
              {(cats.atestados ?? []).map(a => (
                <Option key={a.id} value={a.nombre} className="bg-white">
                  {a.nombre}
                </Option>
              ))}
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select
              size="sm"
              label="Categoría"
              value={fCategoria}
              onChange={(v) => setFCategoria(v || "Todas")}
              selected={() => (fCategoria === "Todas" ? "Todas" : fCategoria)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todas">Todas</Option>
              {(cats.categorias ?? []).map(c => (
                <Option key={c.id} value={c.nombre} className="bg-white">
                  {c.nombre}
                </Option>
              ))}
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select
              size="sm"
              label="Contratación"
              value={fTipoContrato}
              onChange={(v) => setFTipoContrato(v || "Todos")}
              selected={() => (fTipoContrato === "Todos" ? "Todos" : fTipoContrato)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todos">Todos</Option>
              {(cats.tiposContrato ?? []).map(t => (
                <Option key={t.id} value={t.nombre} className="bg-white">
                  {t.nombre}
                </Option>
              ))}
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select
              size="sm"
              label="Estado"
              value={fEstado}
              onChange={(v) => setFEstado(v || "Todos")}
              selected={() => (fEstado === "Todos" ? "Todos" : fEstado)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todos">Todos</Option>
              {(cats.estados ?? []).map(e => (
                <Option key={e.id} value={e.nombre} className="bg-white">
                  {e.nombre}
                </Option>
              ))}
            </Select>
          </div>

          <div className="min-w-[120px]">
            <Select
              size="sm"
              label="Filas"
              value={String(rowsPerPage)}
              onChange={(v) => {
                setRowsPerPage(Number(v || 10));
                setPage(1);
              }}
              selected={() => String(rowsPerPage)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
            </Select>
          </div>

          <div className="ml-auto">
            <Button
              size="sm"
              variant="outlined"
              className="border-[#2B338C] text-[#2B338C]"
              onClick={clearFilters}
            >
              Limpiar
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
      <Card className="overflow-hidden relative z-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1250px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                {[
                  { key: "cedula", label: "Cédula" },
                  { key: "nombre", label: "Nombre" },
                  { key: "primerApellido", label: "Primer apellido" },
                  { key: "segundoApellido", label: "Segundo apellido" },
                  { key: "correo", label: "Correo" },
                  { key: "telefono", label: "Teléfono" },
                  { key: "provincia", label: "Provincia" },
                  { key: "periodoIngreso", label: "Periodo ingreso" }, // 🔹 NUEVA COLUMNA
                  { key: "estado", label: "Estado" },
                ].map(h => (
                  <th key={h.key} className="p-3 text-sm font-semibold">
                    {h.label}
                  </th>
                ))}
                <th className="p-3 text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-blue-gray-500">
                    Cargando…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-blue-gray-500">
                    Sin registros.
                  </td>
                </tr>
              ) : (
                pageData.map(d => (
                  <tr key={d.id} className="border-b">
                    <td className="p-3">{d.cedula}</td>
                    <td className="p-3">{d.nombre}</td>
                    <td className="p-3">{d.primerApellido}</td>
                    <td className="p-3">{d.segundoApellido}</td>
                    <td className="p-3">{d.correo}</td>
                    <td className="p-3">{d.telefono}</td>
                    <td className="p-3">{d.provincia}</td>
                    <td className="p-3">{d.periodoIngreso || "—"}</td>
                    <td className="p-3">
                      <EstadoChip value={d.estado} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Ver ficha">
                          <span>
                            <Button
                              size="sm"
                              variant="outlined"
                              className="border-[#2B338C] text-[#2B338C] p-2"
                              onClick={() => {
                                setFichaId(d.id);
                                setOpenFicha(true);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </span>
                        </Tooltip>

                        <Tooltip content="Editar">
                          <span>
                            <Button
                              size="sm"
                              className="bg-[#FFDA00] text-[#2B338C] p-2"
                              onClick={() => {
                                setEditId(d.id);
                                setOpenEdit(true);
                              }}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </Button>
                          </span>
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
              onClick={() => setPage(p => Math.max(1, p - 1))}
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
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modales */}
      <AgregarDocente
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSaved={(newId) => { setLastTouchedId(newId ?? null); loadRows(); }}
      />
      <FichaDocente
        open={openFicha}
        onClose={() => setOpenFicha(false)}
        id={fichaId}
      />
      <EditarDocente
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        id={editId}
        onSaved={(savedId) => { setLastTouchedId(savedId ?? null); loadRows(); }}
      />
    </div>
  );
}

export default Docentes;
