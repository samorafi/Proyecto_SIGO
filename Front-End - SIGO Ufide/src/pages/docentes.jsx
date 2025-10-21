import { useEffect, useMemo, useState } from "react";
import {
  Card, Button, Input, Select, Option, Typography, Tooltip,
  Dialog, DialogHeader, DialogBody, DialogFooter, Switch
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, EyeIcon, PencilSquareIcon,
  ChevronLeftIcon, ChevronRightIcon, PlusIcon
} from "@heroicons/react/24/outline";

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
      x.motivoDesvinculacionId ?? x.periodoDesvinculacionId
    ),
    nombre: String(
      x.nombre ?? x.Nombre ?? x.descripcion ?? x.label ??
      x.genero ?? x.provincia ?? x.canton ?? x.categoria ??
      x.estado ?? x.tipoContrato ?? x.atestado ?? x.rol ?? x.rolDocente ??
      x.motivo ?? x.periodo
    ),
    __raw: x
  }));
}
const matches = (t, q) => !q || String(t ?? "").toLowerCase().includes(String(q ?? "").toLowerCase());
const findLabel = (list, id) => (list || []).find(x => String(x.id) === String(id))?.nombre ?? "";

/* Z-index/menu fixes */
const MENU_CLS =
  "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";
const Field = ({ children }) => (
  <div className="relative z-0 focus-within:z-[500]">{children}</div>
);

/* ===================== Chips / filas ===================== */
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
function RowInfo({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-blue-gray-500">{label}</p>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

/* ===================== ENDPOINT 2: FICHA DEL DOCENTE ===================== */
function FichaDocente({ open, onClose, id }) {
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!open || !id) return;
      setLoading(true); setError(""); setP(null);
      try {
        const r = await fetch(URL.personaById(id));
        if (!r.ok) throw new Error("GET persona");
        const x = await r.json();
        if (!live) return;
        setP(x);
      } catch (e) {
        if (live) setError("No fue posible cargar la ficha.");
      } finally { if (live) setLoading(false); }
    };
    load();
    return () => { live = false; };
  }, [open, id]);

  const provincia = p?.provincia?.nombre ?? p?.provincia;
  const canton = p?.canton?.nombre ?? p?.canton;
  const generoTxt = p?.genero?.nombre ?? p?.genero;
  const atestadoTxt = p?.atestado?.nombre ?? p?.atestado;
  const categoriaTxt = p?.categoria?.nombre ?? p?.categoria;
  const contratoTxt = p?.tipoContrato?.nombre ?? p?.tipoContrato;
  const estadoTxt = typeof p?.estado === "boolean" ? (p.estado ? "Activo" : "Inactivo") : (p?.estadoPersona?.nombre ?? p?.estado);
  const rolTxt = p?.rolDocente?.nombre ?? p?.rol ?? p?.rolDocente ?? "—";
  const motivoTxt = p?.motivoDesvinculacion?.nombre ?? p?.motivoDesvinculacion ?? "—";
  const periodoTxt = p?.periodoDesvinculacion?.nombre ?? p?.periodoDesvinculacion ?? "—";
  const enLineaTxt = p?.enLinea ? "Sí" : "No";

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader className="text-[#2B338C]">Ficha del docente</DialogHeader>
      <DialogBody className="space-y-4">
        {loading && <p className="text-blue-gray-600">Cargando…</p>}
        {error && !loading && <p className="text-red-600">{error}</p>}
        {!loading && !error && !p && <p className="text-blue-gray-600">No hay datos.</p>}
        {!loading && !!p && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RowInfo label="Nombre" value={p.nombre} />
            <RowInfo label="Género" value={generoTxt} />
            <RowInfo label="Cédula" value={p.cedula} />
            <RowInfo label="Correo" value={p.correo} />
            <RowInfo label="Teléfono" value={p.telefono} />
            <RowInfo label="Provincia" value={provincia} />
            <RowInfo label="Cantón" value={canton} />
            <RowInfo label="Fecha de ingreso" value={p.fechaIngreso?.slice(0, 10)} />
            <RowInfo label="Atestado" value={atestadoTxt} />
            <RowInfo label="Categoría" value={categoriaTxt} />
            <RowInfo label="Tipo de contrato" value={contratoTxt} />
            <RowInfo label="Estado" value={<EstadoChip value={estadoTxt} />} />
            <RowInfo label="Rol docente" value={rolTxt} />
            <RowInfo label="¿Imparte 100% en línea?" value={enLineaTxt} />
            <RowInfo label="Motivo de desvinculación" value={motivoTxt} />
            <RowInfo label="Periodo de desvinculación" value={periodoTxt} />
            <div className="md:col-span-2">
              <RowInfo label="Comentarios" value={p.comentarios} />
            </div>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" className="bg-[#FFDA00] text-[#2B338C]" onClick={onClose}>Cerrar</Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== ENDPOINT 4: AGREGAR DOCENTE ===================== */
function AgregarDocente({ open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    nombre: "", generoId: "", cedula: "", correo: "", telefono: "",
    provinciaId: "", cantonId: "", fechaIngreso: "",
    atestadoId: "", categoriaId: "", tipoContratoId: "", estadoPersonaId: "",
    rolDocenteId: "",   
    enLinea: false, comentarios: ""
  });
  const onChange = (k, v) => setF(s => ({ ...s, [k]: v }));

  const [cat, setCat] = useState({
    generos: [], provincias: [], categorias: [], estados: [],
    tiposContrato: [], atestados: [], roles: [] 
  });

  const [cantonesByProv, setCantonesByProv] = useState({});
  const [loadingCantones, setLoadingCantones] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    (async () => {
      try {
        const [generos, provincias, categorias, estados, tiposContrato, atestados, roles] = await Promise.all([
          fetchArray(URL.generos),
          fetchArray(URL.provincias),
          fetchArray(URL.categorias),
          fetchArray(URL.estados),
          fetchArray(URL.tiposContrato),
          fetchArray(URL.atestados),
          fetchArray(URL.roles),                    
        ]);
        if (!live) return;
        const norm = a => a.map(x => ({ id: String(x.id), nombre: String(x.nombre) }));
        setCat({
          generos: norm(generos),
          provincias: norm(provincias),
          categorias: norm(categorias),
          estados: norm(estados),
          tiposContrato: norm(tiposContrato),
          atestados: norm(atestados),
          roles: norm(roles),                    
        });
      } catch (e) { console.error("catálogos:", e); }
    })();
    return () => { live = false; };
  }, [open]);

  const loadCantones = async (provIdStr) => {
    if (!provIdStr) return [];
    const pid = String(provIdStr);
    if (cantonesByProv[pid]) return cantonesByProv[pid];
    setLoadingCantones(true);
    try {
      const lista = await fetchArray(URL.cantones(pid));
      const filtered = lista.filter(c => {
        const raw = c.__raw ?? {};
        const cid =
          raw.provinciaId ?? raw.provincia_id ?? raw.ProvinciaId ?? raw.ProvinciaID ??
          raw.provincia?.id ?? raw.provinciaIdFk ?? null;
        return cid == null ? true : String(cid) === pid;
      });
      const final = filtered.length ? filtered : lista;
      setCantonesByProv(prev => ({ ...prev, [pid]: final }));
      return final;
    } catch (e) {
      console.error("cantones:", e);
      setCantonesByProv(prev => ({ ...prev, [pid]: [] }));
      return [];
    } finally { setLoadingCantones(false); }
  };

  const onProvinciaChange = (pid) => {
    const val = String(pid ?? "");
    onChange("provinciaId", val);
    onChange("cantonId", "");
    loadCantones(val);
  };

  const cantonesVisibles = cantonesByProv[String(f.provinciaId)] ?? [];

  const validar = () => {
    const req = [
      ["nombre", f.nombre], ["generoId", f.generoId], ["cedula", f.cedula], ["correo", f.correo], ["telefono", f.telefono],
      ["provinciaId", f.provinciaId], ["cantonId", f.cantonId], ["fechaIngreso", f.fechaIngreso],
      ["atestadoId", f.atestadoId], ["categoriaId", f.categoriaId], ["tipoContratoId", f.tipoContratoId],
      ["estadoPersonaId", f.estadoPersonaId], ["rolDocenteId", f.rolDocenteId]  
    ];
    if (req.some(([_, v]) => !v)) { alert("Completa los campos obligatorios."); return false; }
    return true;
  };

  const submit = async () => {
    if (!validar()) return;
    setSaving(true);
    try {
      const body = {
        nombre: f.nombre,
        generoId: Number(f.generoId),
        cedula: f.cedula,
        correo: f.correo,
        telefono: f.telefono,
        provinciaId: Number(f.provinciaId),
        cantonId: Number(f.cantonId),
        fechaIngreso: new Date(f.fechaIngreso).toISOString(),
        atestadoId: Number(f.atestadoId),
        categoriaId: Number(f.categoriaId),
        tipoContratoId: Number(f.tipoContratoId),
        estadoPersonaId: Number(f.estadoPersonaId),
        rolDocenteId: Number(f.rolDocenteId),     
        enLinea: !!f.enLinea,
        comentarios: f.comentarios ?? ""
      };
      const r = await fetch(URL.personas, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("POST persona");

      let newId = null;
      try {
        const txt = await r.text();
        if (txt) {
          const j = JSON.parse(txt);
          newId = j?.id ?? j?.data?.id ?? j?.result?.id ?? j?.personaId ?? j?.data?.personaId ?? null;
        }
      } catch {}
      if (!newId) {
        const loc = r.headers.get("Location");
        if (loc) newId = loc.split("/").pop();
      }

      onSaved && onSaved(newId);
      onClose && onClose();
    } catch (e) {
      console.error(e);
      alert("No fue posible guardar.");
    } finally { setSaving(false); }
  };

  useEffect(() => {
    if (!open) {
      setF({
        nombre: "", generoId: "", cedula: "", correo: "", telefono: "",
        provinciaId: "", cantonId: "", fechaIngreso: "",
        atestadoId: "", categoriaId: "", tipoContratoId: "", estadoPersonaId: "",
        rolDocenteId: "", enLinea: false, comentarios: ""
      });
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      className="z-[2147482000]"
      overlayProps={{ className: "z-[2147481000]" }}
      containerProps={{ className: "z-[2147481500]" }}
    >
      <DialogHeader className="text-[#2B338C]">Agregar docente</DialogHeader>

      <DialogBody className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-visible relative isolate z-0">
        <Field>
          <Input label="Nombre *" value={f.nombre} onChange={e => onChange("nombre", e.target.value)} crossOrigin="" />
        </Field>

        <Field>
          <Select
            label="Género *"
            value={f.generoId}
            onChange={v => onChange("generoId", String(v ?? ""))}
            selected={() => findLabel(cat.generos, f.generoId)}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.generos.map(g => <Option key={g.id} value={g.id} className="bg-white">{g.nombre}</Option>)}
          </Select>
        </Field>

        <Field>
          <Input label="Cédula *" value={f.cedula} onChange={e => onChange("cedula", e.target.value)} crossOrigin="" />
        </Field>

        <Field>
          <Input label="Correo *" value={f.correo} onChange={e => onChange("correo", e.target.value)} crossOrigin="" />
        </Field>

        <Field>
          <Input label="Teléfono *" value={f.telefono} onChange={e => onChange("telefono", e.target.value)} crossOrigin="" />
        </Field>

        <Field>
          <Select
            label="Provincia *"
            value={f.provinciaId}
            onChange={(v) => onProvinciaChange(String(v ?? ""))}
            selected={() => findLabel(cat.provincias, f.provinciaId)}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.provincias.map(p => <Option key={p.id} value={p.id} className="bg-white">{p.nombre}</Option>)}
          </Select>
        </Field>

        <Field>
          <Select
            label={loadingCantones ? "Cantón (cargando…)" : "Cantón *"}
            value={f.cantonId}
            onChange={(v) => onChange("cantonId", String(v ?? ""))}
            selected={() => findLabel(cantonesVisibles, f.cantonId)}
            disabled={!f.provinciaId}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cantonesVisibles.map(c => <Option key={c.id} value={c.id} className="bg-white">{c.nombre}</Option>)}
          </Select>
        </Field>

        <Field>
          <Input
            type="date"
            label="Fecha de ingreso *"
            value={f.fechaIngreso}
            onChange={e => onChange("fechaIngreso", e.target.value)}
            crossOrigin=""
          />
        </Field>

        <Field>
          <Select
            label="Atestado *"
            value={f.atestadoId}
            onChange={(v) => onChange("atestadoId", String(v ?? ""))}
            selected={() => findLabel(cat.atestados, f.atestadoId)}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.atestados.map(a => <Option key={a.id} value={a.id} className="bg-white">{a.nombre}</Option>)}
          </Select>
        </Field>

        <Field>
          <Select
            label="Categoría *"
            value={f.categoriaId}
            onChange={(v) => onChange("categoriaId", String(v ?? ""))}
            selected={() => findLabel(cat.categorias, f.categoriaId)}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.categorias.map(c => <Option key={c.id} value={c.id} className="bg-white">{c.nombre}</Option>)}
          </Select>
        </Field>

        <Field>
          <Select
            label="Tipo de contrato *"
            value={f.tipoContratoId}
            onChange={(v) => onChange("tipoContratoId", String(v ?? ""))}
            selected={() => findLabel(cat.tiposContrato, f.tipoContratoId)}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.tiposContrato.map(t => <Option key={t.id} value={t.id} className="bg-white">{t.nombre}</Option>)}
          </Select>
        </Field>

        <Field>
          <Select
            label="Estado *"
            value={f.estadoPersonaId}
            onChange={(v) => onChange("estadoPersonaId", String(v ?? ""))}
            selected={() => findLabel(cat.estados, f.estadoPersonaId)}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.estados.map(e => <Option key={e.id} value={e.id} className="bg-white">{e.nombre}</Option>)}
          </Select>
        </Field>

        <Field>
          <Select
            label="Rol docente *"                
            value={f.rolDocenteId}
            onChange={(v) => onChange("rolDocenteId", String(v ?? ""))}
            selected={() => findLabel(cat.roles, f.rolDocenteId)}
            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.roles.map(r => <Option key={r.id} value={r.id} className="bg-white">{r.nombre}</Option>)}
          </Select>
        </Field>

        <div className="md:col-span-2 flex items-center gap-3">
          <Typography className="text-blue-gray-700 font-medium">
            ¿El docente imparte clases 100% en línea?
          </Typography>
          <Switch
            checked={!!f.enLinea}
            onChange={(e) => onChange("enLinea", !!e.target.checked)}
            label={f.enLinea ? "Sí" : "No"}
            ripple={false}
          />
        </div>

        <Field>
          <div className="md:col-span-2">
            <Input label="Comentarios" value={f.comentarios} onChange={e => onChange("comentarios", e.target.value)} crossOrigin="" />
          </div>
        </Field>
      </DialogBody>

      <DialogFooter className="gap-2">
        <Button variant="outlined" className="border-blue-gray-300 text-blue-gray-700" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={submit} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== ENDPOINT 3: EDITAR DOCENTE ===================== */
function EditarDocente({ open, onClose, id, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [f, setF] = useState({
    nombre: "", generoId: "", cedula: "", correo: "", telefono: "",
    provinciaId: "", cantonId: "", fechaIngreso: "",
    atestadoId: "", categoriaId: "", tipoContratoId: "", estadoPersonaId: "",
    rolDocenteId: "",                                
    enLinea: false, comentarios: ""
  });
  const onChange = (k, v) => setF(s => ({ ...s, [k]: v }));

  const [cat, setCat] = useState({
    generos: [], provincias: [], categorias: [], estados: [],
    tiposContrato: [], atestados: [], roles: []   
  });

  const [cantonesByProv, setCantonesByProv] = useState({});
  const [loadingCantones, setLoadingCantones] = useState(false);
  const [catsReady, setCatsReady] = useState(false);

  const pickId = (obj, ...paths) => {
    for (const p of paths) {
      const v = p.split(".").reduce((a, k) => (a ? a[k] : undefined), obj);
      if (v != null && v !== "") return String(v);
    }
    return "";
  };
  const byNombre = (arr, nombre) =>
    (arr || []).find(x => String(x.nombre).toLowerCase() === String(nombre ?? "").toLowerCase());
  const findIdByNombre = (arr, nombre) => byNombre(arr, nombre)?.id ?? "";
  const mapEstadoToId = (estados, x) => {
    const idDirecto = pickId(x, "estadoPersonaId", "estadoPersona.id");
    if (idDirecto) return String(idDirecto);
    const boolNombre = (typeof x?.estado === "boolean") ? (x.estado ? "Activo" : "Inactivo") : "";
    const nombre = x?.estadoPersona?.nombre ?? x?.estado ?? boolNombre ?? "";
    return nombre ? (findIdByNombre(estados, nombre) || "") : "";
  };

  // Cargar catálogos
  useEffect(() => {
    if (!open) return;
    let live = true;
    (async () => {
      try {
        const [generos, provincias, categorias, estados, tiposContrato, atestados, roles] = await Promise.all([
          fetchArray(URL.generos),
          fetchArray(URL.provincias),
          fetchArray(URL.categorias),
          fetchArray(URL.estados),
          fetchArray(URL.tiposContrato),
          fetchArray(URL.atestados),
          fetchArray(URL.roles),         
        ]);
        if (!live) return;
        const norm = a => a.map(x => ({ id: String(x.id), nombre: String(x.nombre) }));
        setCat({
          generos: norm(generos),
          provincias: norm(provincias),
          categorias: norm(categorias),
          estados: norm(estados),
          tiposContrato: norm(tiposContrato),
          atestados: norm(atestados),
          roles: norm(roles),                    
        });
      } catch (e) {
        console.error("catálogos (editar):", e);
        setCat({ generos: [], provincias: [], categorias: [], estados: [], tiposContrato: [], atestados: [], roles: [] });
      } finally {
        if (live) setCatsReady(true);
      }
    })();
    return () => { live = false; };
  }, [open]);

  const loadCantones = async (provIdStr) => {
    if (!provIdStr) return [];
    const pid = String(provIdStr);
    if (cantonesByProv[pid]) return cantonesByProv[pid];
    setLoadingCantones(true);
    try {
      const lista = await fetchArray(URL.cantones(pid));
      const filtered = lista.filter(c => {
        const raw = c.__raw ?? {};
        const cid =
          raw.provinciaId ?? raw.provincia_id ?? raw.ProvinciaId ?? raw.ProvinciaID ??
          raw.provincia?.id ?? raw.provinciaIdFk ?? null;
        return cid == null ? true : String(cid) === pid;
      });
      const final = filtered.length ? filtered : lista;
      setCantonesByProv(prev => ({ ...prev, [pid]: final }));
      return final;
    } catch (e) {
      console.error("cantones (editar):", e);
      setCantonesByProv(prev => ({ ...prev, [pid]: [] }));
      return [];
    } finally { setLoadingCantones(false); }
  };

  const onProvinciaChange = async (pid) => {
    const val = String(pid ?? "");
    onChange("provinciaId", val);
    onChange("cantonId", "");
    await loadCantones(val);
  };

  const cantonesVisibles = cantonesByProv[String(f.provinciaId)] ?? [];

  // Cargar persona por id y setear formulario (espera catálogos)
  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!open || !id || !catsReady) return;
      setLoading(true);
      try {
        const r = await fetch(URL.personaById(id));
        if (!r.ok) throw new Error("GET persona");
        const x = await r.json();

        const generoId =
          pickId(x, "generoId", "genero.id") ||
          findIdByNombre(cat.generos, x?.genero?.nombre ?? x?.genero ?? "");

        const provinciaId =
          pickId(x, "provinciaId", "provincia.id", "provinciaIdFk") ||
          findIdByNombre(cat.provincias, x?.provincia?.nombre ?? x?.provincia ?? "");

        const atestadoId =
          pickId(x, "atestadoId", "atestado.id") ||
          findIdByNombre(cat.atestados, x?.atestado?.nombre ?? x?.atestado ?? "");

        const categoriaId =
          pickId(x, "categoriaId", "categoria.id") ||
          findIdByNombre(cat.categorias, x?.categoria?.nombre ?? x?.categoria ?? "");

        const tipoContratoId =
          pickId(x, "tipoContratoId", "tipoContrato.id") ||
          findIdByNombre(cat.tiposContrato, x?.tipoContrato?.nombre ?? x?.tipoContrato ?? "");

        const estadoPersonaId = mapEstadoToId(cat.estados, x);

        const rolDocenteId =
          pickId(x, "rolDocenteId", "rolId", "rolDocente.id") ||   
          findIdByNombre(cat.roles, x?.rolDocente?.nombre ?? x?.rol ?? x?.rolDocente ?? "");

        let cantonId = "";
        if (provinciaId) {
          const cantonesList = await loadCantones(provinciaId);
          cantonId =
            pickId(x, "cantonId", "canton.id") ||
            findIdByNombre(cantonesList, x?.canton?.nombre ?? x?.canton ?? "");
        }

        if (!live) return;
        setF({
          nombre: x?.nombre ?? "",
          generoId: String(generoId || ""),
          cedula: x?.cedula ?? "",
          correo: x?.correo ?? "",
          telefono: x?.telefono ?? "",
          provinciaId: String(provinciaId || ""),
          cantonId: String(cantonId || ""),
          fechaIngreso: x?.fechaIngreso ? String(x.fechaIngreso).slice(0, 10) : "",
          atestadoId: String(atestadoId || ""),
          categoriaId: String(categoriaId || ""),
          tipoContratoId: String(tipoContratoId || ""),
          estadoPersonaId: String(estadoPersonaId || ""),
          rolDocenteId: String(rolDocenteId || ""), 
          enLinea: !!x?.enLinea,
          comentarios: x?.comentarios ?? "",
        });
      } catch (e) {
        console.error("editar GET:", e);
        alert("No fue posible cargar la información del docente.");
        onClose && onClose();
      } finally {
        if (live) setLoading(false);
      }
    };
    load();
    return () => { live = false; };
  }, [open, id, catsReady]);

  const validar = () => {
    const req = [
      ["nombre", f.nombre], ["generoId", f.generoId], ["cedula", f.cedula], ["correo", f.correo], ["telefono", f.telefono],
      ["provinciaId", f.provinciaId], ["cantonId", f.cantonId], ["fechaIngreso", f.fechaIngreso],
      ["atestadoId", f.atestadoId], ["categoriaId", f.categoriaId], ["tipoContratoId", f.tipoContratoId],
      ["estadoPersonaId", f.estadoPersonaId], ["rolDocenteId", f.rolDocenteId]  
    ];
    if (req.some(([_, v]) => !v)) { alert("Completa los campos obligatorios."); return false; }
    return true;
  };

  const submit = async () => {
    if (!validar()) return;
    setSaving(true);
    try {
      const body = {
        id: Number(id),
        personaId: Number(id),
        nombre: f.nombre,
        generoId: Number(f.generoId),
        cedula: f.cedula,
        correo: f.correo,
        telefono: f.telefono,
        provinciaId: Number(f.provinciaId),
        cantonId: Number(f.cantonId),
        fechaIngreso: new Date(f.fechaIngreso).toISOString(),
        atestadoId: Number(f.atestadoId),
        categoriaId: Number(f.categoriaId),
        tipoContratoId: Number(f.tipoContratoId),
        estadoPersonaId: Number(f.estadoPersonaId),
        rolDocenteId: Number(f.rolDocenteId),   
        enLinea: !!f.enLinea,
        comentarios: f.comentarios ?? ""
      };
      const r = await fetch(URL.personaById(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("PUT persona");
      onSaved && onSaved(id);
      onClose && onClose();
    } catch (e) {
      console.error("editar PUT:", e);
      alert("No fue posible guardar los cambios.");
    } finally { setSaving(false); }
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      className="z-[2147482000]"
      overlayProps={{ className: "z-[2147481000]" }}
      containerProps={{ className: "z-[2147481500]" }}
    >
      <DialogHeader className="text-[#2B338C]">Editar docente</DialogHeader>

      <DialogBody className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-visible relative isolate z-0">
        {loading ? (
          <div className="md:col-span-2 text-blue-gray-600">Cargando…</div>
        ) : (
          <>
            <Field><Input label="Nombre *" value={f.nombre} onChange={e => onChange("nombre", e.target.value)} crossOrigin="" /></Field>

            <Field>
              <Select
                label="Género *"
                value={f.generoId}
                onChange={v => onChange("generoId", String(v ?? ""))}
                selected={() => findLabel(cat.generos, f.generoId)}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.generos.map(g => <Option key={g.id} value={g.id} className="bg-white">{g.nombre}</Option>)}
              </Select>
            </Field>

            <Field><Input label="Cédula *" value={f.cedula} onChange={e => onChange("cedula", e.target.value)} crossOrigin="" /></Field>
            <Field><Input label="Correo *" value={f.correo} onChange={e => onChange("correo", e.target.value)} crossOrigin="" /></Field>
            <Field><Input label="Teléfono *" value={f.telefono} onChange={e => onChange("telefono", e.target.value)} crossOrigin="" /></Field>

            <Field>
              <Select
                label="Provincia *"
                value={f.provinciaId}
                onChange={(v) => onProvinciaChange(String(v ?? ""))}
                selected={() => findLabel(cat.provincias, f.provinciaId)}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.provincias.map(p => <Option key={p.id} value={p.id} className="bg-white">{p.nombre}</Option>)}
              </Select>
            </Field>

            <Field>
              <Select
                label={loadingCantones ? "Cantón (cargando…)" : "Cantón *"}
                value={f.cantonId}
                onChange={(v) => onChange("cantonId", String(v ?? ""))}
                selected={() => findLabel(cantonesVisibles, f.cantonId)}
                disabled={!f.provinciaId}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cantonesVisibles.map(c => <Option key={c.id} value={c.id} className="bg-white">{c.nombre}</Option>)}
              </Select>
            </Field>

            <Field><Input type="date" label="Fecha de ingreso *" value={f.fechaIngreso} onChange={e => onChange("fechaIngreso", e.target.value)} crossOrigin="" /></Field>

            <Field>
              <Select
                label="Atestado *"
                value={f.atestadoId}
                onChange={(v) => onChange("atestadoId", String(v ?? ""))}
                selected={() => findLabel(cat.atestados, f.atestadoId)}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.atestados.map(a => <Option key={a.id} value={a.id} className="bg-white">{a.nombre}</Option>)}
              </Select>
            </Field>

            <Field>
              <Select
                label="Categoría *"
                value={f.categoriaId}
                onChange={(v) => onChange("categoriaId", String(v ?? ""))}
                selected={() => findLabel(cat.categorias, f.categoriaId)}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.categorias.map(c => <Option key={c.id} value={c.id} className="bg-white">{c.nombre}</Option>)}
              </Select>
            </Field>

            <Field>
              <Select
                label="Tipo de contrato *"
                value={f.tipoContratoId}
                onChange={(v) => onChange("tipoContratoId", String(v ?? ""))}
                selected={() => findLabel(cat.tiposContrato, f.tipoContratoId)}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.tiposContrato.map(t => <Option key={t.id} value={t.id} className="bg-white">{t.nombre}</Option>)}
              </Select>
            </Field>

            <Field>
              <Select
                label="Estado *"
                value={f.estadoPersonaId}
                onChange={(v) => onChange("estadoPersonaId", String(v ?? ""))}
                selected={() => findLabel(cat.estados, f.estadoPersonaId)}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.estados.map(e => <Option key={e.id} value={e.id} className="bg-white">{e.nombre}</Option>)}
              </Select>
            </Field>

            <Field>
              <Select
                label="Rol docente *"                 
                value={f.rolDocenteId}
                onChange={(v) => onChange("rolDocenteId", String(v ?? ""))}
                selected={() => findLabel(cat.roles, f.rolDocenteId)}
                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.roles.map(r => <Option key={r.id} value={r.id} className="bg-white">{r.nombre}</Option>)}
              </Select>
            </Field>

            <div className="md:col-span-2 flex items-center gap-3">
              <Typography className="text-blue-gray-700 font-medium">
                ¿El docente imparte clases 100% en línea?
              </Typography>
              <Switch
                checked={!!f.enLinea}
                onChange={(e) => onChange("enLinea", !!e.target.checked)}
                label={f.enLinea ? "Sí" : "No"}
                ripple={false}
              />
            </div>

            <div className="md:col-span-2">
              <Field>
                <Input label="Comentarios" value={f.comentarios} onChange={e => onChange("comentarios", e.target.value)} crossOrigin="" />
              </Field>
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter className="gap-2">
        <Button variant="outlined" className="border-blue-gray-300 text-blue-gray-700" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={submit} disabled={saving || loading}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== ENDPOINT 1: VISTA GENERAL ===================== */
export default function Docentes() {
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
  const [cats, setCats] = useState({ categorias: [], estados: [], tiposContrato: [], atestados: [] });
  const [provMap, setProvMap] = useState({});

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
      const [pp, cc, ee, tt, aa] = await Promise.all([
        fetchArray(URL.provincias), fetchArray(URL.categorias), fetchArray(URL.estados),
        fetchArray(URL.tiposContrato), fetchArray(URL.atestados),
      ]);
      setCats({ categorias: cc, estados: ee, tiposContrato: tt, atestados: aa });
      const m = {}; pp.forEach(p => { m[String(p.id)] = p.nombre; }); setProvMap(m);
    } catch (e) { console.error("Error catálogos:", e); }
  };

  const loadRows = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(URL.personas);
      if (!r.ok) throw new Error("GET personas");
      const json = await r.json();
      const arr = Array.isArray(json) ? json : (json.data ?? json.items ?? json.result ?? json.results ?? []);
      const safe = Array.isArray(arr) ? arr : [];

      const provById = provMap || {};
      const catById = Object.fromEntries((cats?.categorias ?? []).map(c => [String(c.id), c.nombre]));
      const contratoById = Object.fromEntries((cats?.tiposContrato ?? []).map(t => [String(t.id), t.nombre]));
      const atestadoById = Object.fromEntries((cats?.atestados ?? []).map(a => [String(a.id), a.nombre]));

      let mapped = safe.map(x => {
        const provinciaId = x.provinciaId ?? x?.provincia?.id ?? null;
        const provinciaNombre = x.provinciaNombre ?? x?.provincia?.nombre ?? x.provincia ?? (provinciaId != null ? provById[String(provinciaId)] ?? "" : "");
        const categoriaId = x.categoriaId ?? x?.categoria?.id ?? null;
        const categoriaNombre = x.categoriaNombre ?? x?.categoria?.nombre ?? x.categoria ?? (categoriaId != null ? catById[String(categoriaId)] ?? "" : "");
        const tipoContratoId = x.tipoContratoId ?? x?.tipoContrato?.id ?? null;
        const tipoContratoNombre = x.tipoContratoNombre ?? x?.tipoContrato?.nombre ?? x.tipoContrato ?? (tipoContratoId != null ? contratoById[String(tipoContratoId)] ?? "" : "");
        const atestadoId = x.atestadoId ?? x?.atestado?.id ?? null;
        const atestadoNombre = x.atestadoNombre ?? x?.atestado?.nombre ?? x.atestado ?? (atestadoId != null ? atestadoById[String(atestadoId)] ?? "" : "");
        const estadoNombre = (typeof x.estado === "boolean") ? (x.estado ? "Activo" : "Inactivo") : (x.estadoNombre ?? x?.estado ?? x?.estadoPersona?.nombre ?? "");
        return {
          id: x.id ?? x.personaId,
          nombre: x.nombre ?? x.nombreCompleto,
          cedula: x.cedula ?? x.identificacion,
          correo: x.correo ?? x.email,
          telefono: x.telefono ?? x.celular,
          provincia: provinciaNombre,
          categoria: categoriaNombre,
          tipoContrato: tipoContratoNombre,
          atestado: atestadoNombre,
          estado: estadoNombre,
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
      console.error(e); setError("No se pudieron cargar los docentes.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCats(); }, []);
  useEffect(() => { loadRows(); }, [
    Object.keys(provMap).length,
    (cats?.categorias ?? []).length,
    (cats?.tiposContrato ?? []).length,
    (cats?.atestados ?? []).length,
    lastTouchedId,
  ]);

  const filtered = useMemo(() => {
    try {
      return rows.filter(r => {
        if (!matches(`${r.nombre} ${r.cedula} ${r.correo} ${r.telefono} ${r.categoria} ${r.tipoContrato} ${r.provincia} ${r.atestado}`, q)) return false;
        if (fAtestado !== "Todos" && r.atestado !== fAtestado) return false;
        if (fCategoria !== "Todas" && r.categoria !== fCategoria) return false;
        if (fEstado !== "Todos" && String(r.estado).toLowerCase() !== String(fEstado).toLowerCase()) return false;
        if (fTipoContrato !== "Todos" && r.tipoContrato !== fTipoContrato) return false;
        return true;
      });
    } catch { return rows; }
  }, [rows, q, fAtestado, fCategoria, fEstado, fTipoContrato]);

  const total = filtered.length;
  const activos = filtered.filter(x => String(x.estado).toLowerCase() === "activo").length;
  const inactivos = filtered.filter(x => String(x.estado).toLowerCase() === "inactivo").length;

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const clearFilters = () => {
    setQ(""); setFAtestado("Todos"); setFCategoria("Todas"); setFEstado("Todos"); setFTipoContrato("Todos");
    setRowsPerPage(10); setPage(1);
  };

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">Docentes</Typography>
          <Typography className="text-blue-gray-600">Vista general</Typography>
        </div>
        <Button size="sm" className="bg-[#2B338C] text-white flex items-center gap-2 rounded-lg px-3 py-2"
          onClick={() => setOpenAdd(true)}>
          <PlusIcon className="h-4 w-4" />
          Agregar docente
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-2 overflow-visible relative z-50">
        <div className="relative flex items-center gap-2 flex-nowrap overflow-visible py-1 px-1">
          <div className="min-w-[220px]">
            <Input size="sm" crossOrigin="" label="Buscar…" icon={<MagnifyingGlassIcon className="h-4 w-4" />}
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="min-w-[180px]">
            <Select size="sm" label="Atestado" value={fAtestado}
              onChange={(v) => setFAtestado(v || "Todos")}
              selected={() => (fAtestado === "Todos" ? "Todos" : fAtestado)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}>
              <Option value="Todos">Todos</Option>
              {(cats.atestados ?? []).map(a => <Option key={a.id} value={a.nombre} className="bg-white">{a.nombre}</Option>)}
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select size="sm" label="Categoría" value={fCategoria}
              onChange={(v) => setFCategoria(v || "Todas")}
              selected={() => (fCategoria === "Todas" ? "Todas" : fCategoria)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}>
              <Option value="Todas">Todas</Option>
              {(cats.categorias ?? []).map(c => <Option key={c.id} value={c.nombre} className="bg-white">{c.nombre}</Option>)}
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select size="sm" label="Contratación" value={fTipoContrato}
              onChange={(v) => setFTipoContrato(v || "Todos")}
              selected={() => (fTipoContrato === "Todos" ? "Todos" : fTipoContrato)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}>
              <Option value="Todos">Todos</Option>
              {(cats.tiposContrato ?? []).map(t => <Option key={t.id} value={t.nombre} className="bg-white">{t.nombre}</Option>)}
            </Select>
          </div>

          <div className="min-w-[160px]">
            <Select size="sm" label="Estado" value={fEstado}
              onChange={(v) => setFEstado(v || "Todos")}
              selected={() => (fEstado === "Todos" ? "Todos" : fEstado)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}>
              <Option value="Todos">Todos</Option>
              {(cats.estados ?? []).map(e => <Option key={e.id} value={e.nombre} className="bg-white">{e.nombre}</Option>)}
            </Select>
          </div>

          <div className="min-w-[120px]">
            <Select size="sm" label="Filas" value={String(rowsPerPage)}
              onChange={(v) => { setRowsPerPage(Number(v || 10)); setPage(1); }}
              selected={() => String(rowsPerPage)}
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}>
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
        <Pill className="bg-[#2B338C]">TOTAL: {total}</Pill>
        <Pill className="bg-green-600">ACTIVOS: {activos}</Pill>
        <Pill className="bg-red-600">INACTIVOS: {inactivos}</Pill>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden relative z-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1150px] w-full text-left">
            <thead>
              <tr className="bg-blue-gray-50 text-blue-gray-700">
                {[
                  { key: "cedula", label: "Cédula" },
                  { key: "nombre", label: "Nombre" },
                  { key: "apellido", label: "Apellido" },
                  { key: "correo", label: "Correo" },
                  { key: "atestado", label: "Atestado" }, 
                  { key: "telefono", label: "Teléfono" },
                  { key: "provincia", label: "Provincia" },
                  { key: "estado", label: "Estado" },
                ].map(h => <th key={h.key} className="p-3 text-sm font-semibold">{h.label}</th>)}
                <th className="p-3 text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="p-6 text-center text-blue-gray-500">Cargando…</td></tr>
              ) : error ? (
                <tr><td colSpan={10} className="p-6 text-center text-red-600">{error}</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-blue-gray-500">Sin registros.</td></tr>
              ) : pageData.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="p-3">{d.cedula}</td>
                  <td className="p-3">{d.nombre}</td>
                  <td className="p-3">-</td>
                  <td className="p-3">{d.correo}</td>
                  <td className="p-3">{d.atestado}</td> 
                  <td className="p-3">{d.telefono}</td>
                  <td className="p-3">{d.provincia}</td>
                  <td className="p-3"><EstadoChip value={d.estado} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Tooltip content="Ver ficha">
                        <span>
                          <Button size="sm" variant="outlined" className="border-[#2B338C] text-[#2B338C] p-2"
                            onClick={() => { setFichaId(d.id); setOpenFicha(true); }}>
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </span>
                      </Tooltip>

                      <Tooltip content="Editar">
                        <span>
                          <Button
                            size="sm"
                            className="bg-[#FFDA00] text-[#2B338C] p-2"
                            onClick={() => { setEditId(d.id); setOpenEdit(true); }}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                        </span>
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
      <AgregarDocente
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSaved={(newId) => { setLastTouchedId(newId ?? null); loadRows(); }}
      />
      <FichaDocente open={openFicha} onClose={() => setOpenFicha(false)} id={fichaId} />
      <EditarDocente
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        id={editId}
        onSaved={(savedId) => { setLastTouchedId(savedId ?? null); loadRows(); }}
      />
    </div>
  );
}
