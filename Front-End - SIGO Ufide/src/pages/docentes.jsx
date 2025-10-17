import { useEffect, useMemo, useState } from "react";
import {
  Card, Button, Input, Select, Option, Typography,
  Tooltip, Dialog, DialogHeader, DialogBody, DialogFooter,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, EyeIcon, PencilSquareIcon,
  ChevronLeftIcon, ChevronRightIcon, PlusIcon
} from "@heroicons/react/24/outline";

/* ===================== API CONFIG ===================== */
const API = import.meta.env.VITE_API_BASE ?? "";
const URL = {
  personas: `${API}/api/personas`,
  generos: `${API}/api/generos`,
  provincias: `${API}/api/provincias`,
  cantones: (provinciaId) => `${API}/api/cantones?provinciaId=${provinciaId}`,
  categorias: `${API}/api/categoriadocentes`,
  estados: `${API}/api/estadospersona`,
  tiposContrato: `${API}/api/tiposcontrato`,
  motivos: `${API}/api/motivosdesvinculacion`,
  periodos: `${API}/api/periodos`,
  atestados: `${API}/api/atestados`
};

/* ===================== HELPERS ===================== */
// Lee y normaliza arrays, tolera {data:[]}, {items:[]}, etc.
async function fetchArray(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  const text = await r.text();
  if (!text) return [];
  const json = JSON.parse(text);
  let arr = Array.isArray(json) ? json : (json.data ?? json.items ?? json.result ?? json.results ?? []);
  if (!Array.isArray(arr)) arr = [];
  return arr.map(normalizeCatalog);
}
// Convierte cualquier catálogo a { id: string, nombre: string }
function normalizeCatalog(x) {
  const id =
    x.id ?? x.Id ?? x.ID ?? x.valor ?? x.value ??
    x.generoId ?? x.provinciaId ?? x.cantonId ?? x.categoriaId ??
    x.estadoPersonaId ?? x.tipoContratoId ?? x.motivoDesvinculacionId ?? x.periodoDesvinculacionId ?? x.atestadoId;
  const nombre =
    x.nombre ?? x.Nombre ?? x.descripcion ?? x.label ??
    x.genero ?? x.provincia ?? x.canton ?? x.categoria ??
    x.estado ?? x.tipoContrato ?? x.motivo ?? x.periodo ?? x.atestado;
  return { id: String(id ?? ""), nombre: String(nombre ?? "") };
}

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
const matches = (t, q) => !q || String(t ?? "").toLowerCase().includes(q.toLowerCase());

/* ===================== FICHA ===================== */
function RowInfo({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-blue-gray-500">{label}</p>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function FichaDocente({ open, onClose, id }) {
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState(null);

  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!open || !id) return;
      setLoading(true);
      try {
        const r = await fetch(`${URL.personas}/${id}`);
        if (!r.ok) throw new Error("GET persona");
        const x = await r.json();
        if (!live) return;
        setP(x);
      } catch (e) {
        console.error(e);
        if (live) setP(null);
      } finally { if (live) setLoading(false); }
    };
    load();
    return () => { live = false; };
  }, [open, id]);

  const provincia = p?.provincia?.nombre ?? p?.provincia;
  const canton = p?.canton?.nombre ?? p?.canton;
  const estadoTxt = typeof p?.estado === "boolean" ? (p.estado ? "Activo" : "Inactivo") : (p?.estadoPersona?.nombre ?? p?.estado);
  const categoriaTxt = p?.categoria?.nombre ?? p?.categoria;
  const generoTxt = p?.genero?.nombre ?? p?.genero;
  const tipoContratoTxt = p?.tipoContrato?.nombre ?? p?.tipoContrato;
  const motivoTxt = p?.motivoDesvinculacion?.nombre ?? p?.motivoDesvinculacion;
  const periodoTxt = p?.periodoDesvinculacion?.nombre ?? p?.periodoDesvinculacion;
  const atestadoTxt = p?.atestado?.nombre ?? p?.atestado;
  const tipoPersonaTxt = p?.tipoPersona ?? "—";

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader className="text-[#2B338C]">Ficha del docente</DialogHeader>
      <DialogBody className="space-y-4">
        {loading ? (
          <p className="text-blue-gray-600">Cargando…</p>
        ) : !p ? (
          <p className="text-blue-gray-600">No hay datos disponibles.</p>
        ) : (
          <>
            {/* Sin foto del usuario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RowInfo label="Nombre" value={p.nombre} />
              <RowInfo label="Cédula" value={p.cedula} />
              <RowInfo label="Género" value={generoTxt} />
              <RowInfo label="Correo" value={p.correo} />
              <RowInfo label="Teléfono" value={p.telefono} />
              <RowInfo label="Provincia" value={provincia} />
              <RowInfo label="Cantón" value={canton} />
              <RowInfo label="Categoría" value={categoriaTxt} />
              <RowInfo label="Estado" value={<EstadoChip value={estadoTxt} />} />
              <RowInfo label="Fecha de ingreso" value={p.fechaIngreso?.slice(0, 10)} />
              <RowInfo label="Tipo de contrato" value={tipoContratoTxt} />
              <RowInfo label="Motivo desvinculación" value={motivoTxt} />
              <RowInfo label="Periodo" value={periodoTxt} />
              <RowInfo label="Atestado" value={atestadoTxt} />
              <RowInfo label="Tipo Persona" value={tipoPersonaTxt} />
              <div className="md:col-span-2"><RowInfo label="Comentarios" value={p.comentarios} /></div>
            </div>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" className="bg-[#FFDA00] text-[#2B338C]" onClick={onClose}>Cerrar</Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== FORM (Crear/Editar) ===================== */
function PersonaForm({ open, onClose, mode, data, onSaved }) {
  const isEdit = mode === "edit";
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    nombre: "", cedula: "", correo: "", telefono: "",
    fechaIngreso: "", comentarios: "",
    generoId: "", provinciaId: "", cantonId: "",
    categoriaId: "", estadoPersonaId: "", tipoContratoId: "",
    motivoDesvinculacionId: "", periodoDesvinculacionId: "",
    atestadoId: "", tipoPersona: "Docente"
  });

  const [cat, setCat] = useState({
    generos: [], provincias: [], cantones: [],
    categorias: [], estados: [], tiposContrato: [],
    motivos: [], periodos: [], atestados: []
  });

  const loadCantones = async (provId) => {
    try {
      if (!provId) { setCat(c => ({ ...c, cantones: [] })); return; }
      const arr = await fetchArray(URL.cantones(provId));
      setCat(c => ({ ...c, cantones: arr }));
    } catch {
      setCat(c => ({ ...c, cantones: [] }));
    }
  };

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [gen, prov, catg, est, tcon, mot, per, ates] = await Promise.all([
          fetchArray(URL.generos),
          fetchArray(URL.provincias),
          fetchArray(URL.categorias),
          fetchArray(URL.estados),
          fetchArray(URL.tiposContrato),
          fetchArray(URL.motivos),
          fetchArray(URL.periodos),
          fetchArray(URL.atestados),
        ]);
        if (!live) return;
        setCat({
          generos: gen, provincias: prov, cantones: [],
          categorias: catg, estados: est, tiposContrato: tcon,
          motivos: mot, periodos: per, atestados: ates
        });
      } catch (e) { console.error("Error cargando catálogos:", e); }
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!open) return;
    if (isEdit && data) {
      const fecha = (data.fechaIngreso ?? "").slice(0, 10);
      const initial = {
        nombre: data.nombre ?? "",
        cedula: data.cedula ?? "",
        correo: data.correo ?? "",
        telefono: data.telefono ?? "",
        fechaIngreso: fecha,
        comentarios: data.comentarios ?? "",
        generoId: String(data.generoId ?? data?.genero?.id ?? ""),
        provinciaId: String(data.provinciaId ?? data?.provincia?.id ?? ""),
        cantonId: String(data.cantonId ?? data?.canton?.id ?? ""),
        categoriaId: String(data.categoriaId ?? data?.categoria?.id ?? ""),
        estadoPersonaId: String(data.estadoPersonaId ?? data?.estadoPersona?.id ?? ""),
        tipoContratoId: String(data.tipoContratoId ?? data?.tipoContrato?.id ?? ""),
        motivoDesvinculacionId: String(data.motivoDesvinculacionId ?? data?.motivoDesvinculacion?.id ?? ""),
        periodoDesvinculacionId: String(data.periodoDesvinculacionId ?? data?.periodoDesvinculacion?.id ?? ""),
        atestadoId: String(data.atestadoId ?? data?.atestado?.id ?? ""),
        tipoPersona: data.tipoPersona ?? "Docente"
      };
      setF(initial);
      if (initial.provinciaId) loadCantones(initial.provinciaId);
    } else {
      setF({
        nombre: "", cedula: "", correo: "", telefono: "",
        fechaIngreso: "", comentarios: "",
        generoId: "", provinciaId: "", cantonId: "",
        categoriaId: "", estadoPersonaId: "", tipoContratoId: "",
        motivoDesvinculacionId: "", periodoDesvinculacionId: "",
        atestadoId: "", tipoPersona: "Docente"
      });
      setCat(c => ({ ...c, cantones: [] }));
    }
  }, [open, isEdit, data]);

  const onChange = (k, v) => setF(s => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!f.nombre || !f.cedula || !f.correo || !f.telefono || !f.generoId || !f.provinciaId || !f.cantonId || !f.categoriaId || !f.estadoPersonaId || !f.tipoContratoId || !f.fechaIngreso || !f.atestadoId) {
      alert("Completa los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...f,
        generoId: Number(f.generoId),
        provinciaId: Number(f.provinciaId),
        cantonId: Number(f.cantonId),
        categoriaId: Number(f.categoriaId),
        estadoPersonaId: Number(f.estadoPersonaId),
        tipoContratoId: Number(f.tipoContratoId),
        atestadoId: f.atestadoId ? Number(f.atestadoId) : null,
        tipoPersona: f.tipoPersona,
        motivoDesvinculacionId: f.motivoDesvinculacionId ? Number(f.motivoDesvinculacionId) : 0,
        periodoDesvinculacionId: f.periodoDesvinculacionId ? Number(f.periodoDesvinculacionId) : 0,
        fechaIngreso: new Date(f.fechaIngreso).toISOString()
      };
      const r = await fetch(isEdit ? `${URL.personas}/${data.id}` : URL.personas, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(isEdit ? "PUT persona" : "POST persona");
      onSaved && onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert("No fue posible guardar.");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader className="text-[#2B338C]">{isEdit ? "Editar persona" : "Agregar persona"}</DialogHeader>
      <DialogBody className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Nombre *" value={f.nombre} onChange={e => onChange("nombre", e.target.value)} crossOrigin="" />
        <Input label="Cédula *" value={f.cedula} onChange={e => onChange("cedula", e.target.value)} crossOrigin="" />
        <Input label="Correo *" value={f.correo} onChange={e => onChange("correo", e.target.value)} crossOrigin="" />
        <Input label="Teléfono *" value={f.telefono} onChange={e => onChange("telefono", e.target.value)} crossOrigin="" />
        <Input type="date" label="Fecha de ingreso *" value={f.fechaIngreso} onChange={e => onChange("fechaIngreso", e.target.value)} crossOrigin="" />

        <Select label="Género *" value={String(f.generoId)} onChange={v => onChange("generoId", v)}>
          {cat.generos.map(g => <Option key={g.id} value={g.id}>{g.nombre}</Option>)}
        </Select>

        <Select label="Provincia *" value={String(f.provinciaId)} onChange={async v => { onChange("provinciaId", v); onChange("cantonId", ""); await loadCantones(v); }}>
          {cat.provincias.map(p => <Option key={p.id} value={p.id}>{p.nombre}</Option>)}
        </Select>

        <Select label="Cantón *" value={String(f.cantonId)} onChange={v => onChange("cantonId", v)}>
          {cat.cantones.map(c => <Option key={c.id} value={c.id}>{c.nombre}</Option>)}
        </Select>

        <Select label="Categoría *" value={String(f.categoriaId)} onChange={v => onChange("categoriaId", v)}>
          {cat.categorias.map(c => <Option key={c.id} value={c.id}>{c.nombre}</Option>)}
        </Select>

        <Select label="Estado *" value={String(f.estadoPersonaId)} onChange={v => onChange("estadoPersonaId", v)}>
          {cat.estados.map(e => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}
        </Select>

        <Select label="Tipo de contrato *" value={String(f.tipoContratoId)} onChange={v => onChange("tipoContratoId", v)}>
          {cat.tiposContrato.map(t => <Option key={t.id} value={t.id}>{t.nombre}</Option>)}
        </Select>

        <Select label="Atestado *" value={String(f.atestadoId)} onChange={v => onChange("atestadoId", v)}>
          {cat.atestados.map(a => <Option key={a.id} value={a.id}>{a.nombre}</Option>)}
        </Select>

        <Select label="Tipo de persona *" value={f.tipoPersona} onChange={v => onChange("tipoPersona", v)}>
          <Option value="Docente">Docente</Option>
          <Option value="Coordinador">Coordinador</Option>
          <Option value="Ambos">Ambos</Option>
        </Select>

        <Select label="Motivo desvinculación" value={String(f.motivoDesvinculacionId)} onChange={v => onChange("motivoDesvinculacionId", v)}>
          <Option value="">—</Option>
          {cat.motivos.map(m => <Option key={m.id} value={m.id}>{m.nombre}</Option>)}
        </Select>

        <Select label="Periodo" value={String(f.periodoDesvinculacionId)} onChange={v => onChange("periodoDesvinculacionId", v)}>
          <Option value="">—</Option>
          {cat.periodos.map(p => <Option key={p.id} value={p.id}>{p.nombre}</Option>)}
        </Select>

        <div className="md:col-span-2">
          <Input label="Comentarios" value={f.comentarios} onChange={e => onChange("comentarios", e.target.value)} crossOrigin="" />
        </div>
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="outlined" className="border-blue-gray-300 text-blue-gray-700" onClick={onClose}>Cancelar</Button>
        <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={submit} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== PÁGINA ===================== */
export default function Docentes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  // filtros
  const [q, setQ] = useState("");
  const [fGenero, setFGenero] = useState("Todos");
  const [fProvincia, setFProvincia] = useState("Todas");
  const [fCategoria, setFCategoria] = useState("Todas");
  const [fEstado, setFEstado] = useState("Todos");

  // catálogos filtros
  const [catsFiltro, setCatsFiltro] = useState({ generos: [], provincias: [], categorias: [], estados: [] });
  // mapa provinciaId -> nombre (para resolver cuando personas trae solo ids)
  const [provMap, setProvMap] = useState({});

  // paginación
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // ficha / form
  const [openFicha, setOpenFicha] = useState(false);
  const [fichaId, setFichaId] = useState(null);

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState(null);

  const loadCatsFiltro = async () => {
    try {
      const [gg, pp, cc, ee] = await Promise.all([
        fetchArray(URL.generos),
        fetchArray(URL.provincias),
        fetchArray(URL.categorias),
        fetchArray(URL.estados)
      ]);
      setCatsFiltro({ generos: gg, provincias: pp, categorias: cc, estados: ee });
      const m = {}; pp.forEach(p => { m[String(p.id)] = p.nombre; });
      setProvMap(m);
    } catch (e) {
      console.error("Error catálogos filtros:", e);
    }
  };

  const loadRows = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(URL.personas);
      if (!r.ok) throw new Error("GET personas");
      const data = await r.json();

      const mapped = (Array.isArray(data) ? data : []).map(x => {
        const provinciaIdRaw = x.provinciaId ?? x?.provincia?.id ?? null;
        const provinciaNombreRaw = x.provinciaNombre ?? x?.provincia?.nombre ?? null;
        const provinciaResuelta = provinciaNombreRaw ?? (provinciaIdRaw != null ? provMap[String(provinciaIdRaw)] : undefined);

        return {
          id: x.id ?? x.personaId,
          nombre: x.nombre ?? x.nombreCompleto,
          cedula: x.cedula ?? x.identificacion,
          genero: x.generoNombre ?? x?.genero?.nombre ?? x.genero, generoId: x.generoId ?? x?.genero?.id,
          correo: x.correo ?? x.email,
          telefono: x.telefono ?? x.celular,

          provincia: provinciaResuelta ?? "",
          provinciaId: provinciaIdRaw ?? "",

          canton: x.cantonNombre ?? x?.canton?.nombre ?? "",
          cantonId: x.cantonId ?? x?.canton?.id ?? "",

          categoria: x.categoriaNombre ?? x?.categoria?.nombre ?? "",
          categoriaId: x.categoriaId ?? x?.categoria?.id ?? "",

          estado: (typeof x.estado === "boolean")
            ? (x.estado ? "Activo" : "Inactivo")
            : (x.estadoNombre ?? x?.estado ?? x?.estadoPersona?.nombre ?? ""),
          estadoPersonaId: x.estadoPersonaId ?? x?.estadoPersona?.id ?? "",

          tipoContrato: x.tipoContratoNombre ?? x?.tipoContrato?.nombre ?? "",
          tipoContratoId: x.tipoContratoId ?? x?.tipoContrato?.id ?? "",

          atestado: x.atestadoNombre ?? x?.atestado?.nombre ?? "",
          atestadoId: x.atestadoId ?? x?.atestado?.id ?? "",

          fechaIngreso: x.fechaIngreso,
          motivoDesvinculacionId: x.motivoDesvinculacionId, periodoDesvinculacionId: x.periodoDesvinculacionId,
          motivoDesvinculacion: x.motivoDesvinculacionNombre ?? x?.motivoDesvinculacion?.nombre,
          periodo: x.periodoDesvinculacionNombre ?? x?.periodoDesvinculacion?.nombre,
          comentarios: x.comentarios,
          __raw: x
        };
      });

      setRows(mapped);
    } catch (e) {
      console.error(e); setError("No se pudieron cargar los docentes.");
    } finally { setLoading(false); }
  };

  // Cargar catálogos y luego personas
  useEffect(() => { loadCatsFiltro(); }, []);
  useEffect(() => { loadRows(); }, [Object.keys(provMap).length]); // cuando tengamos el mapa, resolvemos provincia

  // Si el mapa llega después de las filas, resolver nombres que falten
  useEffect(() => {
    if (!rows.length || !Object.keys(provMap).length) return;
    setRows(prev => prev.map(r => ({
      ...r,
      provincia: r.provincia || (r.provinciaId ? (provMap[String(r.provinciaId)] ?? r.provincia) : r.provincia)
    })));
  }, [provMap]); // eslint-disable-line

  // filtros en memoria
  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (!matches(`${r.nombre} ${r.cedula} ${r.correo} ${r.telefono}`, q)) return false;
      if (fGenero !== "Todos" && r.genero !== fGenero) return false;
      if (fProvincia !== "Todas" && r.provincia !== fProvincia) return false;
      if (fCategoria !== "Todas" && r.categoria !== fCategoria) return false;
      if (fEstado !== "Todos" && String(r.estado).toLowerCase() !== String(fEstado).toLowerCase()) return false;
      return true;
    });
  }, [rows, q, fGenero, fProvincia, fCategoria, fEstado]);

  // totales y paginación
  const total = filtered.length;
  const activos = filtered.filter(x => String(x.estado).toLowerCase() === "activo").length;
  const inactivos = filtered.filter(x => String(x.estado).toLowerCase() === "inactivo").length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // columnas (exactamente lo que pediste)
  const HEAD = [
    { key: "nombre", label: "Nombre" },
    { key: "cedula", label: "Cédula" },
    { key: "genero", label: "Género" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "categoria", label: "Categoría" },
    { key: "tipoContrato", label: "Contratación" },
    { key: "atestado", label: "Atestado" },
    { key: "estado", label: "Estado" },
  ];

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Docentes</Typography>
          <Typography className="text-blue-gray-600">Gestión y consulta de docentes.</Typography>
        </div>
        <Button className="bg-[#2B338C]" onClick={() => { setFormMode("create"); setFormData(null); setOpenForm(true); }}>
          <PlusIcon className="h-5 w-5 mr-2" /> Agregar persona
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <Input crossOrigin="" label="Buscar (nombre, cédula)" icon={<MagnifyingGlassIcon className="h-5 w-5" />} value={q} onChange={e => setQ(e.target.value)} />
          <Select label="Género" value={fGenero} onChange={setFGenero}>
            <Option value="Todos">Todos</Option>
            {catsFiltro.generos.map(g => <Option key={g.id} value={g.nombre}>{g.nombre}</Option>)}
          </Select>
          <Select label="Provincia" value={fProvincia} onChange={setFProvincia}>
            <Option value="Todas">Todas</Option>
            {catsFiltro.provincias.map(p => <Option key={p.id} value={p.nombre}>{p.nombre}</Option>)}
          </Select>
          <Select label="Categoría" value={fCategoria} onChange={setFCategoria}>
            <Option value="Todas">Todas</Option>
            {catsFiltro.categorias.map(c => <Option key={c.id} value={c.nombre}>{c.nombre}</Option>)}
          </Select>
          <Select label="Estado" value={fEstado} onChange={setFEstado}>
            <Option value="Todos">Todos</Option>
            {catsFiltro.estados.map(e => <Option key={e.id} value={e.nombre}>{e.nombre}</Option>)}
          </Select>
          <Select label="Filas por página" value={String(rowsPerPage)} onChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
          </Select>
          <div className="flex items-center justify-between md:justify-end gap-4">
            <Button variant="outlined" className="border-[#2B338C] text-[#2B338C]" onClick={() => {
              setQ(""); setFGenero("Todos"); setFProvincia("Todas"); setFCategoria("Todas"); setFEstado("Todos"); setRowsPerPage(10); setPage(1);
            }}>LIMPIAR FILTROS</Button>
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
                {HEAD.map(h => <th key={h.key} className="p-3 text-sm font-semibold">{h.label}</th>)}
                <th className="p-3 text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={HEAD.length + 1} className="p-6 text-center text-blue-gray-500">Cargando…</td></tr>
              ) : error ? (
                <tr><td colSpan={HEAD.length + 1} className="p-6 text-center text-red-600">{error}</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={HEAD.length + 1} className="p-6 text-center text-blue-gray-500">Sin registros.</td></tr>
              ) : pageData.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="p-3">{d.nombre}</td>
                  <td className="p-3">{d.cedula}</td>
                  <td className="p-3">{d.genero}</td>
                  <td className="p-3">{d.correo}</td>
                  <td className="p-3">{d.telefono}</td>
                  <td className="p-3">{d.categoria}</td>
                  <td className="p-3">{d.tipoContrato}</td>
                  <td className="p-3">{d.atestado}</td>
                  <td className="p-3"><EstadoChip value={d.estado} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Tooltip content="Ver ficha">
                        <Button size="sm" variant="outlined" className="border-[#2B338C] text-[#2B338C] p-2"
                          onClick={() => { setFichaId(d.id); setOpenFicha(true); }}>
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Editar">
                        <Button size="sm" className="bg-[#FFDA00] text-[#2B338C] p-2"
                          onClick={() => { setFormMode("edit"); setFormData(d.__raw ?? d); setOpenForm(true); }}>
                          <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3">
          <span className="text-sm text-blue-gray-600">
            Mostrando <b>{total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, total)}</b> de <b>{total}</b>
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outlined" size="sm" className="border-[#2B338C] text-[#2B338C] px-3" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm">Página <b>{page}</b> de <b>{totalPages}</b></span>
            <Button variant="outlined" size="sm" className="border-[#2B338C] text-[#2B338C] px-3" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modales */}
      <FichaDocente open={openFicha} onClose={() => setOpenFicha(false)} id={fichaId} />
      <PersonaForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        mode={formMode}
        data={formData}
        onSaved={loadRows}
      />
    </div>
  );
}
