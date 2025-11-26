// src/pages/docentes/DocentesDialogs.jsx
import { useEffect, useState } from "react";
import {
  Button, Input, Select, Option, Typography,
  Dialog, DialogHeader, DialogBody, DialogFooter, Switch,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom"; 


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
  periodos: `${API}/api/periodos/`,
  periodoById: (id) => `${API}/api/periodos/${id}`,
  sedes: `${API}/api/sedes`,
};

/* ===================== HELPERS ===================== */
async function fetchArray(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);

  const txt = await r.text();
  if (!txt) return [];

  let j;
  try {
    j = JSON.parse(txt);
  } catch {
    return [];
  }

  let arr = Array.isArray(j)
    ? j
    : (j.data ?? j.items ?? j.result ?? j.results ?? []);

  if (!Array.isArray(arr)) arr = [];

  return arr.map((x) => ({
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
    __raw: x,
  }));
}

const findLabel = (list, id) =>
  (list || []).find((x) => String(x.id) === String(id))?.nombre ?? "";

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

  let j;
  try {
    j = JSON.parse(txt);
  } catch {
    return [];
  }

  let arr = Array.isArray(j)
    ? j
    : (j.data ?? j.items ?? j.result ?? j.results ?? []);

  if (!Array.isArray(arr)) arr = [];

  arr.sort((a, b) => {
    const aId = Number(a.periodoId ?? a.id ?? a.Id ?? a.ID ?? 0);
    const bId = Number(b.periodoId ?? b.id ?? b.Id ?? b.ID ?? 0);
    return bId - aId; // descendente
  });

  return arr.map((x) => ({
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

/* ===================== Chips / filas ===================== */
const Pill = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}
  >
    {children}
  </span>
);

const EstadoChip = ({ value }) => {
  const v = String(value ?? "").toLowerCase();
  const map = {
    activo: "bg-green-600",
    inactivo: "bg-red-600",
    suspendido: "bg-amber-600",
  };
  return (
    <Pill className={map[v] || "bg-blue-gray-600"}>
      {(v || "—").toUpperCase()}
    </Pill>
  );
};

function RowInfo({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-blue-gray-500">{label}</p>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

/* ===================== FICHA DEL DOCENTE ===================== */
function FichaDocente({ open, onClose, id }) {
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState(null);
  const [error, setError] = useState("");

  const [periodoIngresoNombre, setPeriodoIngresoNombre] = useState("—");
  const [periodoDesvNombre, setPeriodoDesvNombre] = useState("—");

  // pestañas internas
  const [activeTab, setActiveTab] = useState("ficha"); // "ficha" | "constelacion"
  const navigate = useNavigate();

  // 1) Cargar persona
  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!open || !id) return;
      setLoading(true);
      setError("");
      setP(null);
      try {
        const r = await fetch(URL.personaById(id));
        if (!r.ok) throw new Error("GET persona");
        const x = await r.json();
        if (!live) return;
        setP(x);
      } catch (e) {
        if (live) setError("No fue posible cargar la ficha.");
      } finally {
        if (live) setLoading(false);
      }
    };
    load();
    return () => {
      live = false;
    };
  }, [open, id]);

  useEffect(() => {
    let live = true;

    const loadPeriodos = async () => {
      if (!p) return;

      const getNombrePeriodo = async (id, fallback) => {
        if (!id) return fallback || "—";
        try {
          const r = await fetch(URL.periodoById(id));
          if (!r.ok) throw new Error("GET periodo");
          const j = await r.json();
          const label = buildPeriodoLabel(j);
          return label || fallback || "—";
        } catch {
          return fallback || "—";
        }
      };

      const ingresoId =
        p.periodoIngresoId ??
        p.periodoIngreso?.id ??
        p.periodoIngreso?.periodoId ??
        null;

      const desvId =
        p.periodoDesvinculacionId ??
        p.periodoDesvinculacion?.id ??
        p.periodoDesvinculacion?.periodoId ??
        null;

      const ingresoFallback =
        buildPeriodoLabel(p.periodoIngreso) ||
        p.periodoIngreso?.nombre ||
        p.periodoIngreso ||
        "";

      const desvFallback =
        buildPeriodoLabel(p.periodoDesvinculacion) ||
        p.periodoDesvinculacion?.nombre ||
        p.periodoDesvinculacion ||
        "";

      const [ingresoNombre, desvNombre] = await Promise.all([
        getNombrePeriodo(ingresoId, ingresoFallback),
        getNombrePeriodo(desvId, desvFallback),
      ]);

      if (!live) return;
      setPeriodoIngresoNombre(ingresoNombre || "—");
      setPeriodoDesvNombre(desvNombre || "—");
    };

    loadPeriodos();
    return () => {
      live = false;
    };
  }, [p]);

  const provincia = p?.provincia?.nombre ?? p?.provincia;
  const canton = p?.canton?.nombre ?? p?.canton;
  const generoTxt = p?.genero?.nombre ?? p?.genero;
  const atestadoTxt = p?.atestado?.nombre ?? p?.atestado;
  const categoriaTxt = p?.categoria?.nombre ?? p?.categoria;
  const contratoTxt = p?.tipoContrato?.nombre ?? p?.tipoContrato;
  const estadoTxt =
    typeof p?.estado === "boolean"
      ? p.estado
        ? "Activo"
        : "Inactivo"
      : p?.estadoPersona?.nombre ?? p?.estado;
  const rolTxt = p?.rolDocente?.nombre ?? p?.rol ?? p?.rolDocente ?? "—";
  const motivoTxt =
    p?.motivoDesvinculacion?.nombre ?? p?.motivoDesvinculacion ?? "—";
  const sedeTxt = p?.sede?.nombre ?? p?.sede ?? "—";
  const enLineaTxt = p?.enLinea ? "Sí" : "No";

  // clases para las pestañas (como el ejemplo Ofertas / Docentes)
  const tabBase =
    "flex-1 text-center py-2 text-sm font-semibold rounded-xl transition-colors";
  const tabActive = "bg-[#2B338C] text-white shadow";
  const tabInactive = "bg-white text-[#2B338C]";

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader className="flex flex-col gap-3 text-[#2B338C]">
        <span>Ficha del docente</span>
        {/* barra de pestañas */}
        <div className="flex w-full rounded-2xl bg-blue-gray-50 p-1">
          <button
            type="button"
            className={`${tabBase} ${
              activeTab === "ficha" ? tabActive : tabInactive
            }`}
            onClick={() => setActiveTab("ficha")}
          >
            Ficha docente
          </button>
          <button
            type="button"
            className={`${tabBase} ${
              activeTab === "constelacion" ? tabActive : tabInactive
            }`}
            onClick={() => setActiveTab("constelacion")}
          >
            Constelación docente
          </button>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-4">
        {loading && <p className="text-blue-gray-600">Cargando…</p>}
        {error && !loading && <p className="text-red-600">{error}</p>}
        {!loading && !error && !p && (
          <p className="text-blue-gray-600">No hay datos.</p>
        )}

        {/* TAB 1: FICHA DOCENTE (contenido actual) */}
        {!loading && !!p && activeTab === "ficha" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RowInfo label="Nombre" value={p.nombre} />
            <RowInfo label="Primer apellido" value={p.primerApellido} />
            <RowInfo label="Segundo apellido" value={p.segundoApellido} />
            <RowInfo label="Cédula" value={p.cedula} />
            <RowInfo label="Género" value={generoTxt} />
            <RowInfo label="Correo" value={p.correo} />
            <RowInfo label="Teléfono" value={p.telefono} />
            <RowInfo label="Provincia" value={provincia} />
            <RowInfo label="Cantón" value={canton} />
            <RowInfo label="Sede" value={sedeTxt} />
            <RowInfo label="Periodo de ingreso" value={periodoIngresoNombre} />
            <RowInfo label="Atestado" value={atestadoTxt} />
            <RowInfo label="Categoría" value={categoriaTxt} />
            <RowInfo label="Rol docente" value={rolTxt} />
            <RowInfo
              label="Estado persona"
              value={<EstadoChip value={estadoTxt} />}
            />
            <RowInfo label="Tipo de contrato" value={contratoTxt} />
            <RowInfo label="Motivo de desvinculación" value={motivoTxt} />
            <RowInfo
              label="Periodo de desvinculación"
              value={periodoDesvNombre}
            />
            <div className="md:col-span-2">
              <RowInfo label="Comentario" value={p.comentarios} />
            </div>
            <RowInfo label="En línea" value={enLineaTxt} />
          </div>
        )}

        {/* TAB 2: CONSTELACIÓN DOCENTE */}
        {!loading && !!p && activeTab === "constelacion" && (
          <div className="space-y-4">
            <Typography className="text-blue-gray-700">
              Aquí irá la información de constelación docente (asignaciones,
              carga, etc.). Por el momento este espacio se deja reservado.
            </Typography>

          
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <Button
          variant="text"
          className="bg-[#FFDA00] text-[#2B338C]"
          onClick={onClose}
        >
          Cerrar
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== AGREGAR DOCENTE ===================== */
function AgregarDocente({ open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    generoId: "",
    cedula: "",
    correo: "",
    telefono: "",
    provinciaId: "",
    cantonId: "",
    sedeId: "",
    periodoIngresoId: "",
    atestadoId: "",
    categoriaId: "",
    tipoContratoId: "",
    estadoPersonaId: "",
    rolDocenteId: "",
    motivoDesvinculacionId: "",
    periodoDesvinculacionId: "",
    enLinea: false,
    comentarios: "",
  });
  const onChange = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const [cat, setCat] = useState({
    generos: [],
    provincias: [],
    categorias: [],
    estados: [],
    tiposContrato: [],
    atestados: [],
    roles: [],
    sedes: [],
    periodos: [],
    motivos: [],
  });

  const [cantonesByProv, setCantonesByProv] = useState({});
  const [loadingCantones, setLoadingCantones] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    (async () => {
      try {
        const [
          generos,
          provincias,
          categorias,
          estados,
          tiposContrato,
          atestados,
          roles,
          sedes,
          periodos,
          motivos,
        ] = await Promise.all([
          fetchArray(URL.generos),
          fetchArray(URL.provincias),
          fetchArray(URL.categorias),
          fetchArray(URL.estados),
          fetchArray(URL.tiposContrato),
          fetchArray(URL.atestados),
          fetchArray(URL.roles),
          fetchArray(URL.sedes),
          fetchPeriodosOrdered(),
          fetchArray(URL.motivos),
        ]);
        if (!live) return;
        const norm = (a) =>
          a.map((x) => ({ id: String(x.id), nombre: String(x.nombre) }));
        setCat({
          generos: norm(generos),
          provincias: norm(provincias),
          categorias: norm(categorias),
          estados: norm(estados),
          tiposContrato: norm(tiposContrato),
          atestados: norm(atestados),
          roles: norm(roles),
          sedes: norm(sedes),
          periodos: norm(periodos),
          motivos: norm(motivos),
        });
      } catch (e) {
        console.error("catálogos:", e);
      }
    })();
    return () => {
      live = false;
    };
  }, [open]);

  const loadCantones = async (provIdStr) => {
    if (!provIdStr) return [];
    const pid = String(provIdStr);
    if (cantonesByProv[pid]) return cantonesByProv[pid];
    setLoadingCantones(true);
    try {
      const lista = await fetchArray(URL.cantones(pid));
      const filtered = lista.filter((c) => {
        const raw = c.__raw ?? {};
        const cid =
          raw.provinciaId ?? raw.provincia_id ?? raw.ProvinciaId ?? raw.ProvinciaID ??
          raw.provincia?.id ?? raw.provinciaIdFk ?? null;
        return cid == null ? true : String(cid) === pid;
      });
      const final = filtered.length ? filtered : lista;
      setCantonesByProv((prev) => ({ ...prev, [pid]: final }));
      return final;
    } catch (e) {
      console.error("cantones:", e);
      setCantonesByProv((prev) => ({ ...prev, [pid]: [] }));
      return [];
    } finally {
      setLoadingCantones(false);
    }
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
      ["nombre", f.nombre],
      ["primerApellido", f.primerApellido],
      ["generoId", f.generoId],
      ["cedula", f.cedula],
      ["correo", f.correo],
      ["telefono", f.telefono],
      ["provinciaId", f.provinciaId],
      ["cantonId", f.cantonId],
      ["periodoIngresoId", f.periodoIngresoId],
      ["atestadoId", f.atestadoId],
      ["categoriaId", f.categoriaId],
      ["tipoContratoId", f.tipoContratoId],
      ["estadoPersonaId", f.estadoPersonaId],
      ["rolDocenteId", f.rolDocenteId],
    ];
    if (req.some(([_, v]) => !v)) {
      alert("Completa los campos obligatorios.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validar()) return;
    setSaving(true);
    try {
      const body = {
        nombre: f.nombre,
        primerApellido: f.primerApellido,
        segundoApellido: f.segundoApellido,
        generoId: Number(f.generoId),
        cedula: f.cedula,
        correo: f.correo,
        telefono: f.telefono,
        provinciaId: Number(f.provinciaId),
        cantonId: Number(f.cantonId),
        sedeId: f.sedeId ? Number(f.sedeId) : null,
        periodoIngresoId: f.periodoIngresoId ? Number(f.periodoIngresoId) : null,
        atestadoId: Number(f.atestadoId),
        categoriaId: Number(f.categoriaId),
        tipoContratoId: Number(f.tipoContratoId),
        estadoPersonaId: Number(f.estadoPersonaId),
        rolDocenteId: Number(f.rolDocenteId),
        motivoDesvinculacionId: f.motivoDesvinculacionId
          ? Number(f.motivoDesvinculacionId)
          : null,
        periodoDesvinculacionId: f.periodoDesvinculacionId
          ? Number(f.periodoDesvinculacionId)
          : null,
        enLinea: !!f.enLinea,
        comentarios: f.comentarios ?? "",
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
          newId =
            j?.id ?? j?.data?.id ?? j?.result?.id ??
            j?.personaId ?? j?.data?.personaId ?? null;
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
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setF({
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        generoId: "",
        cedula: "",
        correo: "",
        telefono: "",
        provinciaId: "",
        cantonId: "",
        sedeId: "",
        periodoIngresoId: "",
        atestadoId: "",
        categoriaId: "",
        tipoContratoId: "",
        estadoPersonaId: "",
        rolDocenteId: "",
        motivoDesvinculacionId: "",
        periodoDesvinculacionId: "",
        enLinea: false,
        comentarios: "",
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
        {/* Nombre, apellidos */}
        <Field>
          <Input
            label="Nombre *"
            value={f.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
            crossOrigin=""
          />
        </Field>
        <Field>
          <Input
            label="Primer apellido *"
            value={f.primerApellido}
            onChange={(e) =>
              onChange("primerApellido", e.target.value)
            }
            crossOrigin=""
          />
        </Field>
        <Field>
          <Input
            label="Segundo apellido"
            value={f.segundoApellido}
            onChange={(e) =>
              onChange("segundoApellido", e.target.value)
            }
            crossOrigin=""
          />
        </Field>
        <Field>
          <Input
            label="Cédula *"
            value={f.cedula}
            onChange={(e) => onChange("cedula", e.target.value)}
            crossOrigin=""
          />
        </Field>

        {/* Género, correo */}
        <Field>
          <Select
            label="Género *"
            value={f.generoId}
            onChange={(v) => onChange("generoId", String(v ?? ""))}
            selected={() => findLabel(cat.generos, f.generoId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.generos.map((g) => (
              <Option key={g.id} value={g.id} className="bg-white">
                {g.nombre}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Input
            label="Correo *"
            value={f.correo}
            onChange={(e) => onChange("correo", e.target.value)}
            crossOrigin=""
          />
        </Field>

        {/* Teléfono, provincia */}
        <Field>
          <Input
            label="Teléfono *"
            value={f.telefono}
            onChange={(e) => onChange("telefono", e.target.value)}
            crossOrigin=""
          />
        </Field>
        <Field>
          <Select
            label="Provincia *"
            value={f.provinciaId}
            onChange={(v) => onProvinciaChange(String(v ?? ""))}
            selected={() => findLabel(cat.provincias, f.provinciaId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.provincias.map((p) => (
              <Option key={p.id} value={p.id} className="bg-white">
                {p.nombre}
              </Option>
            ))}
          </Select>
        </Field>

        {/* Cantón, sede */}
        <Field>
          <Select
            label={loadingCantones ? "Cantón (cargando…)" : "Cantón *"}
            value={f.cantonId}
            onChange={(v) => onChange("cantonId", String(v ?? ""))}
            selected={() => findLabel(cantonesVisibles, f.cantonId)}
            disabled={!f.provinciaId}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cantonesVisibles.map((c) => (
              <Option key={c.id} value={c.id} className="bg-white">
                {c.nombre}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Select
            label="Sede"
            value={f.sedeId}
            onChange={(v) => onChange("sedeId", String(v ?? ""))}
            selected={() => findLabel(cat.sedes, f.sedeId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.sedes.map((s) => (
              <Option key={s.id} value={s.id} className="bg-white">
                {s.nombre}
              </Option>
            ))}
          </Select>
        </Field>

        {/* Periodo ingreso, atestado */}
        <Field>
          <Select
            label="Periodo de ingreso *"
            value={f.periodoIngresoId}
            onChange={(v) =>
              onChange("periodoIngresoId", String(v ?? ""))
            }
            selected={() => findLabel(cat.periodos, f.periodoIngresoId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.periodos.map((p) => (
              <Option key={p.id} value={p.id} className="bg-white">
                {p.nombre}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Select
            label="Atestado *"
            value={f.atestadoId}
            onChange={(v) => onChange("atestadoId", String(v ?? ""))}
            selected={() => findLabel(cat.atestados, f.atestadoId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.atestados.map((a) => (
              <Option key={a.id} value={a.id} className="bg-white">
                {a.nombre}
              </Option>
            ))}
          </Select>
        </Field>

        {/* Categoría, rol docente */}
        <Field>
          <Select
            label="Categoría *"
            value={f.categoriaId}
            onChange={(v) => onChange("categoriaId", String(v ?? ""))}
            selected={() => findLabel(cat.categorias, f.categoriaId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.categorias.map((c) => (
              <Option key={c.id} value={c.id} className="bg-white">
                {c.nombre}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Select
            label="Rol docente *"
            value={f.rolDocenteId}
            onChange={(v) => onChange("rolDocenteId", String(v ?? ""))}
            selected={() => findLabel(cat.roles, f.rolDocenteId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.roles.map((r) => (
              <Option key={r.id} value={r.id} className="bg-white">
                {r.nombre}
              </Option>
            ))}
          </Select>
        </Field>

        {/* Estado persona, tipo contrato */}
        <Field>
          <Select
            label="Estado persona *"
            value={f.estadoPersonaId}
            onChange={(v) =>
              onChange("estadoPersonaId", String(v ?? ""))
            }
            selected={() => findLabel(cat.estados, f.estadoPersonaId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.estados.map((e) => (
              <Option key={e.id} value={e.id} className="bg-white">
                {e.nombre}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Select
            label="Tipo de contrato *"
            value={f.tipoContratoId}
            onChange={(v) =>
              onChange("tipoContratoId", String(v ?? ""))
            }
            selected={() => findLabel(cat.tiposContrato, f.tipoContratoId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.tiposContrato.map((t) => (
              <Option key={t.id} value={t.id} className="bg-white">
                {t.nombre}
              </Option>
            ))}
          </Select>
        </Field>

        {/* Motivo y periodo de desvinculación */}
        <Field>
          <Select
            label="Motivo de desvinculación"
            value={f.motivoDesvinculacionId}
            onChange={(v) =>
              onChange("motivoDesvinculacionId", String(v ?? ""))
            }
            selected={() => findLabel(cat.motivos, f.motivoDesvinculacionId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.motivos.map((m) => (
              <Option key={m.id} value={m.id} className="bg-white">
                {m.nombre}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Select
            label="Periodo de desvinculación"
            value={f.periodoDesvinculacionId}
            onChange={(v) =>
              onChange("periodoDesvinculacionId", String(v ?? ""))
            }
            selected={() => findLabel(cat.periodos, f.periodoDesvinculacionId)}
            menuProps={{
              className: MENU_CLS,
              keepMounted: true,
              placement: "bottom-start",
            }}
            containerProps={{ className: CONT_CLS }}
          >
            {cat.periodos.map((p) => (
              <Option key={p.id} value={p.id} className="bg-white">
                {p.nombre}
              </Option>
            ))}
          </Select>
        </Field>

        {/* Comentario */}
        <div className="md:col-span-2">
          <Field>
            <Input
              label="Comentario"
              value={f.comentarios}
              onChange={(e) => onChange("comentarios", e.target.value)}
              crossOrigin=""
            />
          </Field>
        </div>

        {/* En línea */}
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
      </DialogBody>

      <DialogFooter className="gap-2">
        <Button
          variant="outlined"
          className="border-blue-gray-300 text-blue-gray-700"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          className="bg-[#FFDA00] text-[#2B338C]"
          onClick={submit}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== EDITAR DOCENTE ===================== */
function EditarDocente({ open, onClose, id, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [f, setF] = useState({
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    generoId: "",
    cedula: "",
    correo: "",
    telefono: "",
    provinciaId: "",
    cantonId: "",
    sedeId: "",
    periodoIngresoId: "",
    atestadoId: "",
    categoriaId: "",
    tipoContratoId: "",
    estadoPersonaId: "",
    rolDocenteId: "",
    motivoDesvinculacionId: "",
    periodoDesvinculacionId: "",
    enLinea: false,
    comentarios: "",
  });
  const onChange = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const [cat, setCat] = useState({
    generos: [],
    provincias: [],
    categorias: [],
    estados: [],
    tiposContrato: [],
    atestados: [],
    roles: [],
    sedes: [],
    periodos: [],
    motivos: [],
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
    (arr || []).find(
      (x) =>
        String(x.nombre).toLowerCase() ===
        String(nombre ?? "").toLowerCase()
    );
  const findIdByNombre = (arr, nombre) => byNombre(arr, nombre)?.id ?? "";
  const mapEstadoToId = (estados, x) => {
    const idDirecto = pickId(x, "estadoPersonaId", "estadoPersona.id");
    if (idDirecto) return String(idDirecto);
    const boolNombre =
      typeof x?.estado === "boolean"
        ? x.estado
          ? "Activo"
          : "Inactivo"
        : "";
    const nombre =
      x?.estadoPersona?.nombre ?? x?.estado ?? boolNombre ?? "";
    return nombre ? findIdByNombre(estados, nombre) || "" : "";
  };

  useEffect(() => {
    if (!open) return;
    let live = true;
    (async () => {
      try {
        const [
          generos,
          provincias,
          categorias,
          estados,
          tiposContrato,
          atestados,
          roles,
          sedes,
          periodos,
          motivos,
        ] = await Promise.all([
          fetchArray(URL.generos),
          fetchArray(URL.provincias),
          fetchArray(URL.categorias),
          fetchArray(URL.estados),
          fetchArray(URL.tiposContrato),
          fetchArray(URL.atestados),
          fetchArray(URL.roles),
          fetchArray(URL.sedes),
          fetchPeriodosOrdered(),
          fetchArray(URL.motivos),
        ]);
        if (!live) return;
        const norm = (a) =>
          a.map((x) => ({ id: String(x.id), nombre: String(x.nombre) }));
        setCat({
          generos: norm(generos),
          provincias: norm(provincias),
          categorias: norm(categorias),
          estados: norm(estados),
          tiposContrato: norm(tiposContrato),
          atestados: norm(atestados),
          roles: norm(roles),
          sedes: norm(sedes),
          periodos: norm(periodos),
          motivos: norm(motivos),
        });
      } catch (e) {
        console.error("catálogos (editar):", e);
        setCat({
          generos: [],
          provincias: [],
          categorias: [],
          estados: [],
          tiposContrato: [],
          atestados: [],
          roles: [],
          sedes: [],
          periodos: [],
          motivos: [],
        });
      } finally {
        if (live) setCatsReady(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [open]);

  const loadCantones = async (provIdStr) => {
    if (!provIdStr) return [];
    const pid = String(provIdStr);
    if (cantonesByProv[pid]) return cantonesByProv[pid];
    setLoadingCantones(true);
    try {
      const lista = await fetchArray(URL.cantones(pid));
      const filtered = lista.filter((c) => {
        const raw = c.__raw ?? {};
        const cid =
          raw.provinciaId ?? raw.provincia_id ?? raw.ProvinciaId ?? raw.ProvinciaID ??
          raw.provincia?.id ?? raw.provinciaIdFk ?? null;
        return cid == null ? true : String(cid) === pid;
      });
      const final = filtered.length ? filtered : lista;
      setCantonesByProv((prev) => ({ ...prev, [pid]: final }));
      return final;
    } catch (e) {
      console.error("cantones (editar):", e);
      setCantonesByProv((prev) => ({ ...prev, [pid]: [] }));
      return [];
    } finally {
      setLoadingCantones(false);
    }
  };

  const onProvinciaChange = async (pid) => {
    const val = String(pid ?? "");
    onChange("provinciaId", val);
    onChange("cantonId", "");
    await loadCantones(val);
  };

  const cantonesVisibles = cantonesByProv[String(f.provinciaId)] ?? [];

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
          findIdByNombre(
            cat.generos,
            x?.genero?.nombre ?? x?.genero ?? ""
          );

        const provinciaId =
          pickId(x, "provinciaId", "provincia.id", "provinciaIdFk") ||
          findIdByNombre(
            cat.provincias,
            x?.provincia?.nombre ?? x?.provincia ?? ""
          );

        const atestadoId =
          pickId(x, "atestadoId", "atestado.id") ||
          findIdByNombre(
            cat.atestados,
            x?.atestado?.nombre ?? x?.atestado ?? ""
          );

        const categoriaId =
          pickId(x, "categoriaId", "categoria.id") ||
          findIdByNombre(
            cat.categorias,
            x?.categoria?.nombre ?? x?.categoria ?? ""
          );

        const tipoContratoId =
          pickId(x, "tipoContratoId", "tipoContrato.id") ||
          findIdByNombre(
            cat.tiposContrato,
            x?.tipoContrato?.nombre ?? x?.tipoContrato ?? ""
          );

        const estadoPersonaId = mapEstadoToId(cat.estados, x);

        const rolDocenteId =
          pickId(x, "rolDocenteId", "rolId", "rolDocente.id") ||
          findIdByNombre(
            cat.roles,
            x?.rolDocente?.nombre ?? x?.rol ?? x?.rolDocente ?? ""
          );

        const sedeId =
          pickId(x, "sedeId", "sede.id") ||
          findIdByNombre(
            cat.sedes,
            x?.sede?.nombre ?? x?.sede ?? ""
          );

        const periodoIngresoLabel =
          buildPeriodoLabel(x?.periodoIngreso) ||
          x?.periodoIngreso?.nombre ||
          x?.periodoIngreso ||
          "";

        const periodoIngresoId =
          pickId(x, "periodoIngresoId", "periodoIngreso.id") ||
          findIdByNombre(cat.periodos, periodoIngresoLabel);

        const motivoDesvinculacionId =
          pickId(x, "motivoDesvinculacionId", "motivoDesvinculacion.id") ||
          findIdByNombre(
            cat.motivos,
            x?.motivoDesvinculacion?.nombre ||
              x?.motivoDesvinculacion ||
              ""
          );

        const periodoDesvinculacionLabel =
          buildPeriodoLabel(x?.periodoDesvinculacion) ||
          x?.periodoDesvinculacion?.nombre ||
          x?.periodoDesvinculacion ||
          "";

        const periodoDesvinculacionId =
          pickId(
            x,
            "periodoDesvinculacionId",
            "periodoDesvinculacion.id"
          ) || findIdByNombre(cat.periodos, periodoDesvinculacionLabel);

        let cantonId = "";
        if (provinciaId) {
          const cantonesList = await loadCantones(provinciaId);
          cantonId =
            pickId(x, "cantonId", "canton.id") ||
            findIdByNombre(
              cantonesList,
              x?.canton?.nombre ?? x?.canton ?? ""
            );
        }

        if (!live) return;
        setF({
          nombre: x?.nombre ?? "",
          primerApellido: x?.primerApellido ?? "",
          segundoApellido: x?.segundoApellido ?? "",
          generoId: String(generoId || ""),
          cedula: x?.cedula ?? "",
          correo: x?.correo ?? "",
          telefono: x?.telefono ?? "",
          provinciaId: String(provinciaId || ""),
          cantonId: String(cantonId || ""),
          sedeId: String(sedeId || ""),
          periodoIngresoId: String(periodoIngresoId || ""),
          atestadoId: String(atestadoId || ""),
          categoriaId: String(categoriaId || ""),
          tipoContratoId: String(tipoContratoId || ""),
          estadoPersonaId: String(estadoPersonaId || ""),
          rolDocenteId: String(rolDocenteId || ""),
          motivoDesvinculacionId: String(motivoDesvinculacionId || ""),
          periodoDesvinculacionId: String(periodoDesvinculacionId || ""),
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
    return () => {
      live = false;
    };
  }, [open, id, catsReady]);

  const validar = () => {
    const req = [
      ["nombre", f.nombre],
      ["primerApellido", f.primerApellido],
      ["generoId", f.generoId],
      ["cedula", f.cedula],
      ["correo", f.correo],
      ["telefono", f.telefono],
      ["provinciaId", f.provinciaId],
      ["cantonId", f.cantonId],
      ["periodoIngresoId", f.periodoIngresoId],
      ["atestadoId", f.atestadoId],
      ["categoriaId", f.categoriaId],
      ["tipoContratoId", f.tipoContratoId],
      ["estadoPersonaId", f.estadoPersonaId],
      ["rolDocenteId", f.rolDocenteId],
    ];
    if (req.some(([_, v]) => !v)) {
      alert("Completa los campos obligatorios.");
      return false;
    }
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
        primerApellido: f.primerApellido,
        segundoApellido: f.segundoApellido,
        generoId: Number(f.generoId),
        cedula: f.cedula,
        correo: f.correo,
        telefono: f.telefono,
        provinciaId: Number(f.provinciaId),
        cantonId: Number(f.cantonId),
        sedeId: f.sedeId ? Number(f.sedeId) : null,
        periodoIngresoId: f.periodoIngresoId
          ? Number(f.periodoIngresoId)
          : null,
        atestadoId: Number(f.atestadoId),
        categoriaId: Number(f.categoriaId),
        tipoContratoId: Number(f.tipoContratoId),
        estadoPersonaId: Number(f.estadoPersonaId),
        rolDocenteId: Number(f.rolDocenteId),
        motivoDesvinculacionId: f.motivoDesvinculacionId
          ? Number(f.motivoDesvinculacionId)
          : null,
        periodoDesvinculacionId: f.periodoDesvinculacionId
          ? Number(f.periodoDesvinculacionId)
          : null,
        enLinea: !!f.enLinea,
        comentarios: f.comentarios ?? "",
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
    } finally {
      setSaving(false);
    }
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
          <div className="md:col-span-2 text-blue-gray-600">
            Cargando…
          </div>
        ) : (
          <>
            {/* Nombre, apellidos */}
            <Field>
              <Input
                label="Nombre *"
                value={f.nombre}
                onChange={(e) => onChange("nombre", e.target.value)}
                crossOrigin=""
              />
            </Field>
            <Field>
              <Input
                label="Primer apellido *"
                value={f.primerApellido}
                onChange={(e) =>
                  onChange("primerApellido", e.target.value)
                }
                crossOrigin=""
              />
            </Field>
            <Field>
              <Input
                label="Segundo apellido"
                value={f.segundoApellido}
                onChange={(e) =>
                  onChange("segundoApellido", e.target.value)
                }
                crossOrigin=""
              />
            </Field>
            <Field>
              <Input
                label="Cédula *"
                value={f.cedula}
                onChange={(e) => onChange("cedula", e.target.value)}
                crossOrigin=""
              />
            </Field>

            {/* Género, correo */}
            <Field>
              <Select
                label="Género *"
                value={f.generoId}
                onChange={(v) => onChange("generoId", String(v ?? ""))}
                selected={() => findLabel(cat.generos, f.generoId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.generos.map((g) => (
                  <Option key={g.id} value={g.id} className="bg-white">
                    {g.nombre}
                  </Option>
                ))}
              </Select>
            </Field>
            <Field>
              <Input
                label="Correo *"
                value={f.correo}
                onChange={(e) => onChange("correo", e.target.value)}
                crossOrigin=""
              />
            </Field>

            {/* Teléfono, provincia */}
            <Field>
              <Input
                label="Teléfono *"
                value={f.telefono}
                onChange={(e) => onChange("telefono", e.target.value)}
                crossOrigin=""
              />
            </Field>
            <Field>
              <Select
                label="Provincia *"
                value={f.provinciaId}
                onChange={(v) => onProvinciaChange(String(v ?? ""))}
                selected={() => findLabel(cat.provincias, f.provinciaId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.provincias.map((p) => (
                  <Option key={p.id} value={p.id} className="bg-white">
                    {p.nombre}
                  </Option>
                ))}
              </Select>
            </Field>

            {/* Cantón, sede */}
            <Field>
              <Select
                label={loadingCantones ? "Cantón (cargando…)" : "Cantón *"}
                value={f.cantonId}
                onChange={(v) => onChange("cantonId", String(v ?? ""))}
                selected={() => findLabel(cantonesVisibles, f.cantonId)}
                disabled={!f.provinciaId}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cantonesVisibles.map((c) => (
                  <Option key={c.id} value={c.id} className="bg-white">
                    {c.nombre}
                  </Option>
                ))}
              </Select>
            </Field>
            <Field>
              <Select
                label="Sede"
                value={f.sedeId}
                onChange={(v) => onChange("sedeId", String(v ?? ""))}
                selected={() => findLabel(cat.sedes, f.sedeId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.sedes.map((s) => (
                  <Option key={s.id} value={s.id} className="bg-white">
                    {s.nombre}
                  </Option>
                ))}
              </Select>
            </Field>

            {/* Periodo ingreso, atestado */}
            <Field>
              <Select
                label="Periodo de ingreso *"
                value={f.periodoIngresoId}
                onChange={(v) =>
                  onChange("periodoIngresoId", String(v ?? ""))
                }
                selected={() => findLabel(cat.periodos, f.periodoIngresoId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.periodos.map((p) => (
                  <Option key={p.id} value={p.id} className="bg-white">
                    {p.nombre}
                  </Option>
                ))}
              </Select>
            </Field>
            <Field>
              <Select
                label="Atestado *"
                value={f.atestadoId}
                onChange={(v) => onChange("atestadoId", String(v ?? ""))}
                selected={() => findLabel(cat.atestados, f.atestadoId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.atestados.map((a) => (
                  <Option key={a.id} value={a.id} className="bg-white">
                    {a.nombre}
                  </Option>
                ))}
              </Select>
            </Field>

            {/* Categoría, rol docente */}
            <Field>
              <Select
                label="Categoría *"
                value={f.categoriaId}
                onChange={(v) => onChange("categoriaId", String(v ?? ""))}
                selected={() => findLabel(cat.categorias, f.categoriaId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.categorias.map((c) => (
                  <Option key={c.id} value={c.id} className="bg-white">
                    {c.nombre}
                  </Option>
                ))}
              </Select>
            </Field>
            <Field>
              <Select
                label="Rol docente *"
                value={f.rolDocenteId}
                onChange={(v) => onChange("rolDocenteId", String(v ?? ""))}
                selected={() => findLabel(cat.roles, f.rolDocenteId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.roles.map((r) => (
                  <Option key={r.id} value={r.id} className="bg-white">
                    {r.nombre}
                  </Option>
                ))}
              </Select>
            </Field>

            {/* Estado persona, tipo contrato */}
            <Field>
              <Select
                label="Estado persona *"
                value={f.estadoPersonaId}
                onChange={(v) =>
                  onChange("estadoPersonaId", String(v ?? ""))
                }
                selected={() => findLabel(cat.estados, f.estadoPersonaId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.estados.map((e) => (
                  <Option key={e.id} value={e.id} className="bg-white">
                    {e.nombre}
                  </Option>
                ))}
              </Select>
            </Field>
            <Field>
              <Select
                label="Tipo de contrato *"
                value={f.tipoContratoId}
                onChange={(v) =>
                  onChange("tipoContratoId", String(v ?? ""))
                }
                selected={() =>
                  findLabel(cat.tiposContrato, f.tipoContratoId)
                }
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.tiposContrato.map((t) => (
                  <Option key={t.id} value={t.id} className="bg-white">
                    {t.nombre}
                  </Option>
                ))}
              </Select>
            </Field>

            {/* Motivo y periodo de desvinculación */}
            <Field>
              <Select
                label="Motivo de desvinculación"
                value={f.motivoDesvinculacionId}
                onChange={(v) =>
                  onChange("motivoDesvinculacionId", String(v ?? ""))
                }
                selected={() => findLabel(cat.motivos, f.motivoDesvinculacionId)}
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.motivos.map((m) => (
                  <Option key={m.id} value={m.id} className="bg-white">
                    {m.nombre}
                  </Option>
                ))}
              </Select>
            </Field>
            <Field>
              <Select
                label="Periodo de desvinculación"
                value={f.periodoDesvinculacionId}
                onChange={(v) =>
                  onChange("periodoDesvinculacionId", String(v ?? ""))
                }
                selected={() =>
                  findLabel(cat.periodos, f.periodoDesvinculacionId)
                }
                menuProps={{
                  className: MENU_CLS,
                  keepMounted: true,
                  placement: "bottom-start",
                }}
                containerProps={{ className: CONT_CLS }}
              >
                {cat.periodos.map((p) => (
                  <Option key={p.id} value={p.id} className="bg-white">
                    {p.nombre}
                  </Option>
                ))}
              </Select>
            </Field>

            {/* Comentario */}
            <div className="md:col-span-2">
              <Field>
                <Input
                  label="Comentario"
                  value={f.comentarios}
                  onChange={(e) =>
                    onChange("comentarios", e.target.value)
                  }
                  crossOrigin=""
                />
              </Field>
            </div>

            {/* En línea */}
            <div className="md:col-span-2 flex items-center gap-3">
              <Typography className="text-blue-gray-700 font-medium">
                ¿El docente imparte clases 100% en línea?
              </Typography>
              <Switch
                checked={!!f.enLinea}
                onChange={(e) =>
                  onChange("enLinea", !!e.target.checked)
                }
                label={f.enLinea ? "Sí" : "No"}
                ripple={false}
              />
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter className="gap-2">
        <Button
          variant="outlined"
          className="border-blue-gray-300 text-blue-gray-700"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          className="bg-[#FFDA00] text-[#2B338C]"
          onClick={submit}
          disabled={saving || loading}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* exports */
export { FichaDocente, AgregarDocente, EditarDocente };
