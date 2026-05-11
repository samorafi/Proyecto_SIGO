import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button, Input, Select, Option, Typography,
  Dialog, DialogHeader, DialogBody, DialogFooter, Switch, Textarea
} from "@material-tailwind/react";
import { alertService } from "@/services/alert.service";
import AppModal from "@/components/ui/Modals/AppModal";
import { apiFetch } from "@/services/apiClientService";

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

/* ===================== CONSTANTES ===================== */
const MENU_CLS =
  "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";

const EMPTY_FORM = {
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
};

const EMPTY_CATALOGS = {
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
};

/* ===================== HELPERS ===================== */
async function fetchArray(url) {
  const r = await apiFetch(url);
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
    : j.data ?? j.items ?? j.result ?? j.results ?? [];

  if (!Array.isArray(arr)) arr = [];

  return arr.map((x) => ({
    id: String(
      x.id ??
      x.Id ??
      x.ID ??
      x.valor ??
      x.value ??
      x.generoId ??
      x.provinciaId ??
      x.cantonId ??
      x.categoriaId ??
      x.estadoPersonaId ??
      x.tipoContratoId ??
      x.atestadoId ??
      x.rolDocenteId ??
      x.rolId ??
      x.motivoDesvinculacionId ??
      x.periodoDesvinculacionId ??
      x.sedeId ??
      x.periodoIngresoId
    ),
    nombre: String(
      x.nombre ??
      x.Nombre ??
      x.descripcion ??
      x.label ??
      x.genero ??
      x.provincia ??
      x.canton ??
      x.categoria ??
      x.estado ??
      x.tipoContrato ??
      x.atestado ??
      x.rol ??
      x.rolDocente ??
      x.motivo ??
      x.periodo ??
      x.sede ??
      ""
    ),
    __raw: x,
  }));
}

const normalizeList = (arr = []) =>
  arr.map((x) => ({ id: String(x.id), nombre: String(x.nombre) }));

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
  const r = await apiFetch(url);
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
    : j.data ?? j.items ?? j.result ?? j.results ?? [];

  if (!Array.isArray(arr)) arr = [];

  arr.sort((a, b) => {
    const aAnio = Number(a.anio ?? a.Anio ?? a.anioAcademico ?? a.year ?? 0);
    const bAnio = Number(b.anio ?? b.Anio ?? b.anioAcademico ?? b.year ?? 0);

    if (bAnio !== aAnio) return bAnio - aAnio;

    const aNumero = Number(a.numero ?? a.Numero ?? a.num ?? a.Num ?? 0);
    const bNumero = Number(b.numero ?? b.Numero ?? b.num ?? b.Num ?? 0);

    if (bNumero !== aNumero) return bNumero - aNumero;

    const aId = Number(a.periodoId ?? a.id ?? a.Id ?? a.ID ?? 0);
    const bId = Number(b.periodoId ?? b.id ?? b.Id ?? b.ID ?? 0);

    return bId - aId;
  });

  return arr.map((x) => ({
    id: String(x.periodoId ?? x.id ?? x.Id ?? x.ID),
    nombre: buildPeriodoLabel(x),
    __raw: x,
  }));
}

async function loadCatalogs() {
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

  return {
    generos: normalizeList(generos),
    provincias: normalizeList(provincias),
    categorias: normalizeList(categorias),
    estados: normalizeList(estados),
    tiposContrato: normalizeList(tiposContrato),
    atestados: normalizeList(atestados),
    roles: normalizeList(roles),
    sedes: normalizeList(sedes),
    periodos: normalizeList(periodos),
    motivos: normalizeList(motivos),
  };
}

const pickId = (obj, ...paths) => {
  for (const p of paths) {
    const v = p.split(".").reduce((a, k) => (a ? a[k] : undefined), obj);
    if (v != null && v !== "") return String(v);
  }
  return "";
};

const byNombre = (arr, nombre) =>
  (arr || []).find(
    (x) => String(x.nombre).toLowerCase() === String(nombre ?? "").toLowerCase()
  );

const findIdByNombre = (arr, nombre) => byNombre(arr, nombre)?.id ?? "";

const getEstadoText = (value) => {
  if (typeof value?.estado === "boolean") return value.estado ? "Activo" : "Inactivo";
  return value?.estadoPersona?.nombre ?? value?.estado ?? "";
};

const getPeriodoFallback = (x) =>
  buildPeriodoLabel(x) || x?.nombre || x || "";

const buildPayload = (f, id = null) => ({
  ...(id != null ? { id: Number(id), personaId: Number(id) } : {}),
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
});

const validateForm = (f) => {
  const req = [
    f.nombre,
    f.primerApellido,
    f.generoId,
    f.cedula,
    f.correo,
    f.telefono,
    f.provinciaId,
    f.cantonId,
    f.periodoIngresoId,
    f.atestadoId,
    f.categoriaId,
    f.tipoContratoId,
    f.estadoPersonaId,
    f.rolDocenteId,
  ];
  return !req.some((v) => !v);
};

/* ===================== UI HELPERS ===================== */
const Field = ({ children }) => (
  <div className="relative z-0 focus-within:z-[500]">{children}</div>
);

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
      {(value || "—").toString()}
    </Pill>
  );
};

function Campo({ label, value, chip = false }) {
  return (
    <div>
      <p className="text-[#2B338C] font-bold mb-1">{label}:</p>
      {chip ? value : <p className="text-gray-700 text-md">{value ?? "—"}</p>}
    </div>
  );
}

function SeccionFicha({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md text-[15px] leading-tight">
      <h2 className="text-[#2B338C] font-bold text-base mb-4 border-b border-gray-300 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoPill({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-blue-gray-50/40 p-3 border border-blue-gray-50">
      <span className="text-[10px] font-bold text-blue-gray-400 uppercase tracking-tight">
        {label}
      </span>
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-xs">{icon}</span>
        <span className="text-[13px] font-bold text-blue-gray-800 truncate">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

function BloqueResumenDocente({
  p,
  estadoTxt,
  categoriaTxt,
  rolTxt,
  sedeTxt,
  periodoIngresoNombre,
  subtitle,
  showDirty = false,
}) {
  const nombreCompleto = [p?.nombre, p?.primerApellido, p?.segundoApellido]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-gray-100 bg-white p-5 shadow-sm">
      <div className="absolute top-0 left-0 h-1 w-full bg-[#FFDA00]" />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <Typography className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-gray-400">
              Información del docente
            </Typography>
            <Typography className="text-lg sm:text-xl font-black text-[#2B338C] leading-tight">
              {nombreCompleto || "Docente"}
            </Typography>
            <Typography className="text-sm text-blue-gray-500">
              {subtitle || `Cédula: ${p?.cedula || "—"}`}
            </Typography>
          </div>

          {showDirty ? (
            <div className="flex items-center gap-2 bg-orange-50 px-2 py-1 rounded-md">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[11px] font-bold text-orange-800">
                Cambios sin guardar
              </span>
            </div>
          ) : (
            <div className="shrink-0">
              <span className="inline-flex items-center rounded-lg bg-[#2B338C]/5 px-3 py-1.5 text-xs font-bold text-[#2B338C] border border-[#2B338C]/10 uppercase">
                {estadoTxt || "—"}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoPill label="Categoría" value={categoriaTxt} />
          <InfoPill label="Rol docente" value={rolTxt} />
          <InfoPill label="Sede" value={sedeTxt} />
          <InfoPill label="Periodo ingreso" value={periodoIngresoNombre} />
        </div>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, required = false }) {
  return (
    <Field>
      <Input
        label={`${label}${required ? " *" : ""}`}
        value={value}
        onChange={onChange}
        crossOrigin=""
      />
    </Field>
  );
}

function SelectField({
  label,
  value,
  onChange,
  list = [],
  disabled = false,
}) {
  return (
    <Field>
      <Select
        label={label}
        value={value}
        onChange={(v) => onChange(String(v ?? ""))}
        selected={() => findLabel(list, value)}
        disabled={disabled}
        menuProps={{
          className: MENU_CLS,
          keepMounted: true,
          placement: "bottom-start",
        }}
        containerProps={{ className: CONT_CLS }}
      >
        {list.map((item) => (
          <Option key={item.id} value={item.id} className="bg-white">
            {item.nombre}
          </Option>
        ))}
      </Select>
    </Field>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <Field>
      <Textarea label={label} value={value} onChange={onChange} />
    </Field>
  );
}

/* ===================== CAMPOS REUTILIZABLES ===================== */
function InformacionGeneralFields({
  f,
  onChange,
  cat,
  cantonesVisibles,
  loadingCantones,
  onProvinciaChange,
}) {
  return (
    <SeccionFicha title="Información General">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 overflow-visible relative isolate z-0 mt-2">
        <TextField
          label="Nombre"
          required
          value={f.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
        />
        <TextField
          label="Primer apellido"
          required
          value={f.primerApellido}
          onChange={(e) => onChange("primerApellido", e.target.value)}
        />
        <TextField
          label="Segundo apellido"
          value={f.segundoApellido}
          onChange={(e) => onChange("segundoApellido", e.target.value)}
        />
        <TextField
          label="Cédula"
          required
          value={f.cedula}
          onChange={(e) => onChange("cedula", e.target.value)}
        />

        <SelectField
          label="Género *"
          value={f.generoId}
          onChange={(v) => onChange("generoId", v)}
          list={cat.generos}
        />
        <TextField
          label="Correo"
          required
          value={f.correo}
          onChange={(e) => onChange("correo", e.target.value)}
        />

        <TextField
          label="Teléfono"
          required
          value={f.telefono}
          onChange={(e) => onChange("telefono", e.target.value)}
        />
        <SelectField
          label="Provincia *"
          value={f.provinciaId}
          onChange={onProvinciaChange}
          list={cat.provincias}
        />

        <SelectField
          label={loadingCantones ? "Cantón (cargando…)" : "Cantón *"}
          value={f.cantonId}
          onChange={(v) => onChange("cantonId", v)}
          list={cantonesVisibles}
          disabled={!f.provinciaId}
        />
      </div>
    </SeccionFicha>
  );
}

function InformacionDocenteFields({ f, onChange, cat }) {
  return (
    <SeccionFicha title="Información Docente">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 overflow-visible relative isolate z-0 mt-2">
        <SelectField
          label="Sede"
          value={f.sedeId}
          onChange={(v) => onChange("sedeId", v)}
          list={cat.sedes}
        />
        <SelectField
          label="Periodo de ingreso *"
          value={f.periodoIngresoId}
          onChange={(v) => onChange("periodoIngresoId", v)}
          list={cat.periodos}
        />
        <SelectField
          label="Atestado *"
          value={f.atestadoId}
          onChange={(v) => onChange("atestadoId", v)}
          list={cat.atestados}
        />
        <SelectField
          label="Categoría *"
          value={f.categoriaId}
          onChange={(v) => onChange("categoriaId", v)}
          list={cat.categorias}
        />
        <SelectField
          label="Rol docente *"
          value={f.rolDocenteId}
          onChange={(v) => onChange("rolDocenteId", v)}
          list={cat.roles}
        />
        <SelectField
          label="Tipo de contrato *"
          value={f.tipoContratoId}
          onChange={(v) => onChange("tipoContratoId", v)}
          list={cat.tiposContrato}
        />
        <SelectField
          label="Estado persona *"
          value={f.estadoPersonaId}
          onChange={(v) => onChange("estadoPersonaId", v)}
          list={cat.estados}
        />
      </div>
    </SeccionFicha>
  );
}

function InformacionDesvinculacionFields({ f, onChange, cat }) {
  return (
    <SeccionFicha title="Información de Desvinculación">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 overflow-visible relative isolate z-0 mt-2">
        <SelectField
          label="Motivo"
          value={f.motivoDesvinculacionId}
          onChange={(v) => onChange("motivoDesvinculacionId", v)}
          list={cat.motivos}
        />
        <SelectField
          label="Periodo"
          value={f.periodoDesvinculacionId}
          onChange={(v) => onChange("periodoDesvinculacionId", v)}
          list={cat.periodos}
        />
        <div className="md:col-span-2">
          <TextAreaField
            label="Comentario"
            value={f.comentarios}
            onChange={(e) => onChange("comentarios", e.target.value)}
          />
        </div>
      </div>
    </SeccionFicha>
  );
}

/* ===================== HOOK REUTILIZABLE ===================== */
function useDocenteCatalogs(open) {
  const [cat, setCat] = useState(EMPTY_CATALOGS);
  const [cantonesByProv, setCantonesByProv] = useState({});
  const [loadingCantones, setLoadingCantones] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;

    (async () => {
      try {
        const data = await loadCatalogs();
        if (!live) return;
        setCat(data);
      } catch (e) {
        console.error("catálogos:", e);
        if (live) setCat(EMPTY_CATALOGS);
      } finally {
        if (live) setReady(true);
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
          raw.provinciaId ??
          raw.provincia_id ??
          raw.ProvinciaId ??
          raw.ProvinciaID ??
          raw.provincia?.id ??
          raw.provinciaIdFk ??
          null;

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

  return { cat, ready, cantonesByProv, loadingCantones, loadCantones };
}

/* ===================== VER FICHA DOCENTE ===================== */
function FichaDocente({ open, onClose, id }) {
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [periodoIngresoNombre, setPeriodoIngresoNombre] = useState("—");
  const [periodoDesvNombre, setPeriodoDesvNombre] = useState("—");
  const [motivoNombre, setMotivoNombre] = useState("—");

  useEffect(() => {
    let live = true;

    const load = async () => {
      if (!open || !id) return;
      setLoading(true);
      setError("");
      setP(null);

      try {
        const r = await apiFetch(URL.personaById(id));
        if (!r.ok) throw new Error("GET persona");
        const x = await r.json();
        if (!live) return;
        setP(x);
      } catch {
        if (live) { alertService.Error("Error", "No fue posible cargar la ficha."); onClose?.(); }
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

      const getNombrePeriodo = async (periodoId, fallback) => {
        if (!periodoId) return fallback || "—";
        try {
          const r = await apiFetch(URL.periodoById(periodoId));
          if (!r.ok) throw new Error("GET periodo");
          const j = await r.json();
          return buildPeriodoLabel(j) || fallback || "—";
        } catch {
          return fallback || "—";
        }
      };

      const ingresoId =
        p.periodoIngresoId ?? p.periodoIngreso?.id ?? p.periodoIngreso?.periodoId ?? null;
      const desvId =
        p.periodoDesvinculacionId ??
        p.periodoDesvinculacion?.id ??
        p.periodoDesvinculacion?.periodoId ??
        null;

      const [ingresoNombre, desvNombre] = await Promise.all([
        getNombrePeriodo(ingresoId, getPeriodoFallback(p.periodoIngreso)),
        getNombrePeriodo(desvId, getPeriodoFallback(p.periodoDesvinculacion)),
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

  useEffect(() => {
    let live = true;

    const loadMotivo = async () => {
      if (!p) return;

      const motivoId =
        p?.motivoDesvinculacionId ??
        p?.motivoDesvinculacion?.id ??
        p?.motivoDesvinculacion?.motivoDesvinculacionId ??
        null;

      if (!motivoId) {
        if (live) setMotivoNombre("—");
        return;
      }

      try {
        const lista = await fetchArray(URL.motivos);
        const nombre = findLabel(lista, motivoId);
        if (live) setMotivoNombre(nombre || "—");
      } catch {
        if (live) setMotivoNombre("—");
      }
    };

    loadMotivo();
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
  const estadoTxt = getEstadoText(p);
  const rolTxt = p?.rolDocente?.nombre ?? p?.rol ?? p?.rolDocente ?? "—";
  const sedeTxt = p?.sede?.nombre ?? p?.sede ?? "—";

  const title = p?.nombre
    ? `Ficha del Docente - ${[p?.nombre, p?.primerApellido, p?.segundoApellido]
      .filter(Boolean)
      .join(" ")}`
    : "Ficha del Docente";

  return (
    <AppModal
      open={open}
      onClose={onClose}
      size="lg"
      title={title}
      footer={
        <Button
          className="bg-[#FFDA00] text-[#2B338C] text-md font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-md hover:bg-[#FFD700] transition-all"
          onClick={onClose}
        >
          Cerrar
        </Button>
      }
    >
      {loading && (
        <Typography className="text-blue-gray-600 text-center py-4">
          Cargando información...
        </Typography>
      )}

      {error && (
        <Typography className="text-red-600 text-center py-4">
          {error}
        </Typography>
      )}

      {!loading && !error && !p && (
        <Typography className="text-blue-gray-600 text-center py-4">
          No hay datos.
        </Typography>
      )}

      {!loading && !error && !!p && (
        <div className="max-h-[70vh] overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
          <div className="flex flex-col gap-6 py-1">
            <BloqueResumenDocente
              p={p}
              estadoTxt={estadoTxt}
              categoriaTxt={categoriaTxt}
              rolTxt={rolTxt}
              sedeTxt={sedeTxt}
              periodoIngresoNombre={periodoIngresoNombre}
            />

            <SeccionFicha title="Información General">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
                <Campo label="Nombre" value={p.nombre} />
                <Campo label="Primer Apellido" value={p.primerApellido} />
                <Campo label="Segundo Apellido" value={p.segundoApellido} />
                <Campo label="Cédula" value={p.cedula} />
                <Campo label="Género" value={generoTxt} />
                <Campo label="Correo" value={p.correo} />
                <Campo label="Teléfono" value={p.telefono} />
                <Campo label="Provincia" value={provincia} />
                <Campo label="Cantón" value={canton} />
              </div>
            </SeccionFicha>

            <SeccionFicha title="Información Docente">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
                <Campo label="Sede" value={sedeTxt} />
                <Campo label="Periodo de ingreso" value={periodoIngresoNombre} />
                <Campo label="Atestado" value={atestadoTxt} />
                <Campo label="Categoría" value={categoriaTxt} />
                <Campo label="Rol docente" value={rolTxt} />
                <Campo label="Tipo de contrato" value={contratoTxt} />
                <Campo label="Estado" value={<EstadoChip value={estadoTxt} />} chip />
              </div>
            </SeccionFicha>

            <SeccionFicha title="Información de Desvinculación">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
                <Campo label="Motivo" value={motivoNombre} />
                <Campo label="Periodo" value={periodoDesvNombre} />
                <div className="md:col-span-2">
                  <Campo
                    label="Comentario"
                    value={p.comentarios || "No cuenta con comentarios."}
                  />
                </div>
              </div>
            </SeccionFicha>
          </div>
        </div>
      )}
    </AppModal>
  );
}

/* ===================== AGREGAR DOCENTE ===================== */
function AgregarDocente({ open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState(EMPTY_FORM);
  const blockParentCloseRef = useRef(false);
  const { cat, cantonesByProv, loadingCantones, loadCantones } = useDocenteCatalogs(open);

  const closeModal = () => {
    blockParentCloseRef.current = false;
    onClose?.();
  };

  const handleModalClose = () => {
    if (blockParentCloseRef.current) return;
    onClose?.();
  };

  const showValidationError = () => {
    blockParentCloseRef.current = true;
    const result = alertService.error("Validación", "Completa los campos obligatorios.");

    if (result && typeof result.finally === "function") {
      result.finally(() => {
        setTimeout(() => {
          blockParentCloseRef.current = false;
        }, 0);
      });
    }
    // Si alertService.error no devuelve una promesa, mantenemos bloqueado
    // el cierre automático hasta que el usuario edite un campo o presione Cancelar.
    // Esto evita que el cierre del modal de alerta cierre también el modal de registro.
  };

  const onChange = (k, v) => {
    blockParentCloseRef.current = false;
    setF((s) => ({ ...s, [k]: v }));
  };

  const onProvinciaChange = async (pid) => {
    const val = String(pid ?? "");
    onChange("provinciaId", val);
    onChange("cantonId", "");
    await loadCantones(val);
  };

  const cantonesVisibles = cantonesByProv[String(f.provinciaId)] ?? [];

  const submit = async () => {
    if (!validateForm(f)) {
      showValidationError();
      return;
    }

    setSaving(true);
    try {
      alertService.loading("Guardando...", "Registrando docente")
      const r = await apiFetch(URL.personas, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(f)),
      });

      if (!r.ok) throw new Error("POST persona");

      let newId = null;
      try {
        const txt = await r.text();
        if (txt) {
          const j = JSON.parse(txt);
          newId =
            j?.id ??
            j?.data?.id ??
            j?.result?.id ??
            j?.personaId ??
            j?.data?.personaId ??
            null;
        }
      } catch { }

      if (!newId) {
        const loc = r.headers.get("Location");
        if (loc) newId = loc.split("/").pop();
      }

      alertService.close();
      alertService.toastSuccess("Docente agregado correctamente.");

      onSaved?.(newId);
      closeModal();
    } catch (e) {
      alertService.close();
      alertService.error("Error", "No fue posible guardar el docente.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) setF(EMPTY_FORM);
  }, [open]);

  return (
    <AppModal
      open={open}
      onClose={handleModalClose}
      size="lg"
      title="Agregar Docente"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full border-t border-blue-gray-50 pt-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={closeModal}
            disabled={saving}
            className="w-full sm:w-auto capitalize font-bold"
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#FFDA00] text-[#2B338C] shadow-md hover:shadow-lg active:opacity-[0.85] w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
            onClick={submit}
            disabled={saving}
          >
            <span className="font-bold">{saving ? "Guardando..." : "Guardar"}</span>
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
        <div className="flex flex-col gap-6 py-1">
          <BloqueResumenDocente
            p={f}
            estadoTxt=""
            categoriaTxt={findLabel(cat.categorias, f.categoriaId)}
            rolTxt={findLabel(cat.roles, f.rolDocenteId)}
            sedeTxt={findLabel(cat.sedes, f.sedeId)}
            periodoIngresoNombre={findLabel(cat.periodos, f.periodoIngresoId)}
            subtitle="Completa la información para crear la ficha docente."
          />

          <InformacionGeneralFields
            f={f}
            onChange={onChange}
            cat={cat}
            cantonesVisibles={cantonesVisibles}
            loadingCantones={loadingCantones}
            onProvinciaChange={onProvinciaChange}
          />

          <InformacionDocenteFields f={f} onChange={onChange} cat={cat} />

          <InformacionDesvinculacionFields f={f} onChange={onChange} cat={cat} />
        </div>
      </div>
    </AppModal>
  );
}

/* ===================== EDITAR DOCENTE ===================== */
function EditarDocente({ open, onClose, id, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState(EMPTY_FORM);
  const [originalData, setOriginalData] = useState(null);

  const { cat, ready, cantonesByProv, loadingCantones, loadCantones } =
    useDocenteCatalogs(open);

  const onChange = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const onProvinciaChange = async (pid) => {
    const val = String(pid ?? "");
    onChange("provinciaId", val);
    onChange("cantonId", "");
    await loadCantones(val);
  };
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setOriginalData(null);
    setF(EMPTY_FORM);
  }, [open, id]);

  const cantonesVisibles = cantonesByProv[String(f.provinciaId)] ?? [];

  useEffect(() => {
    let live = true;

    const load = async () => {
      if (!open || !id || !ready) return;

      setLoading(true);
      try {
        const r = await apiFetch(URL.personaById(id));
        if (!r.ok) throw new Error("GET persona");
        const x = await r.json();
        if (!live) return;

        setOriginalData(x);

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

        const estadoPersonaId =
          pickId(x, "estadoPersonaId", "estadoPersona.id") ||
          findIdByNombre(cat.estados, getEstadoText(x));

        const rolDocenteId =
          pickId(x, "rolDocenteId", "rolId", "rolDocente.id") ||
          findIdByNombre(cat.roles, x?.rolDocente?.nombre ?? x?.rol ?? x?.rolDocente ?? "");

        const sedeId =
          pickId(x, "sedeId", "sede.id") ||
          findIdByNombre(cat.sedes, x?.sede?.nombre ?? x?.sede ?? "");

        const periodoIngresoId =
          pickId(x, "periodoIngresoId", "periodoIngreso.id") ||
          findIdByNombre(cat.periodos, getPeriodoFallback(x?.periodoIngreso));

        const motivoDesvinculacionId =
          pickId(x, "motivoDesvinculacionId", "motivoDesvinculacion.id") ||
          findIdByNombre(
            cat.motivos,
            x?.motivoDesvinculacion?.nombre || x?.motivoDesvinculacion || ""
          );

        const periodoDesvinculacionId =
          pickId(x, "periodoDesvinculacionId", "periodoDesvinculacion.id") ||
          findIdByNombre(cat.periodos, getPeriodoFallback(x?.periodoDesvinculacion));

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
        alertService.error("Error", "No fue posible cargar la información del docente.");

        onClose?.();
      } finally {
        if (live) setLoading(false);
      }
    };

    load();
    return () => {
      live = false;
    };
  }, [open, id, ready]);

  const hasChanges = useMemo(() => {
    if (!originalData) return false;

    const base = {
      nombre: String(originalData?.nombre ?? ""),
      primerApellido: String(originalData?.primerApellido ?? ""),
      segundoApellido: String(originalData?.segundoApellido ?? ""),
      generoId: String(
        pickId(originalData, "generoId", "genero.id") ||
        findIdByNombre(cat.generos, originalData?.genero?.nombre ?? originalData?.genero ?? "")
      ),
      cedula: String(originalData?.cedula ?? ""),
      correo: String(originalData?.correo ?? ""),
      telefono: String(originalData?.telefono ?? ""),
      provinciaId: String(
        pickId(originalData, "provinciaId", "provincia.id", "provinciaIdFk") ||
        findIdByNombre(cat.provincias, originalData?.provincia?.nombre ?? originalData?.provincia ?? "")
      ),
      cantonId: String(
        pickId(originalData, "cantonId", "canton.id") || ""
      ),
      sedeId: String(
        pickId(originalData, "sedeId", "sede.id") ||
        findIdByNombre(cat.sedes, originalData?.sede?.nombre ?? originalData?.sede ?? "")
      ),
      periodoIngresoId: String(
        pickId(originalData, "periodoIngresoId", "periodoIngreso.id") ||
        findIdByNombre(cat.periodos, getPeriodoFallback(originalData?.periodoIngreso))
      ),
      atestadoId: String(
        pickId(originalData, "atestadoId", "atestado.id") ||
        findIdByNombre(cat.atestados, originalData?.atestado?.nombre ?? originalData?.atestado ?? "")
      ),
      categoriaId: String(
        pickId(originalData, "categoriaId", "categoria.id") ||
        findIdByNombre(cat.categorias, originalData?.categoria?.nombre ?? originalData?.categoria ?? "")
      ),
      tipoContratoId: String(
        pickId(originalData, "tipoContratoId", "tipoContrato.id") ||
        findIdByNombre(cat.tiposContrato, originalData?.tipoContrato?.nombre ?? originalData?.tipoContrato ?? "")
      ),
      estadoPersonaId: String(
        pickId(originalData, "estadoPersonaId", "estadoPersona.id") ||
        findIdByNombre(cat.estados, getEstadoText(originalData))
      ),
      rolDocenteId: String(
        pickId(originalData, "rolDocenteId", "rolId", "rolDocente.id") ||
        findIdByNombre(
          cat.roles,
          originalData?.rolDocente?.nombre ?? originalData?.rol ?? originalData?.rolDocente ?? ""
        )
      ),
      motivoDesvinculacionId: String(
        pickId(originalData, "motivoDesvinculacionId", "motivoDesvinculacion.id") ||
        findIdByNombre(
          cat.motivos,
          originalData?.motivoDesvinculacion?.nombre ?? originalData?.motivoDesvinculacion ?? ""
        )
      ),
      periodoDesvinculacionId: String(
        pickId(originalData, "periodoDesvinculacionId", "periodoDesvinculacion.id") ||
        findIdByNombre(cat.periodos, getPeriodoFallback(originalData?.periodoDesvinculacion))
      ),
      comentarios: String(originalData?.comentarios ?? ""),
    };

    return Object.keys(base).some((key) => String(f[key] ?? "") !== String(base[key] ?? ""));
  }, [f, originalData, cat, pickId, findIdByNombre]);

  const submit = async () => {
    if (!validateForm(f)) {
      alertService.error("Validación", "Completa los campos obligatorios.");
      return;
    }
    try {
      setSaving(true);
      alertService.loading("Actualizando...", "Aplicando cambios.");

      const r = await apiFetch(URL.personaById(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(f, id)),
      });

      if (!r.ok) throw new Error("PUT persona");

      alertService.close();
      alertService.toastSuccess("Docente actualizado correctamente.");

      onSaved?.(id);
      onClose?.();
    } catch (e) {
      console.error(e);
      alertService.close();
      alertService.error("Error", "No fue posible guardar los cambios.");

    } finally {
      setSaving(false);
    }
  };

  const nombreCompleto = [f.nombre, f.primerApellido, f.segundoApellido]
    .filter(Boolean)
    .join(" ");

  return (
    <AppModal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Editar Docente${nombreCompleto ? ` - ${nombreCompleto}` : ""}`}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full border-t border-blue-gray-50 pt-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={onClose}
            disabled={loading || saving}
            className="w-full sm:w-auto capitalize font-bold"
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#FFDA00] text-[#2B338C] shadow-md hover:shadow-lg active:opacity-[0.85] w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
            onClick={submit}
            disabled={saving || loading || !hasChanges}
          >
            <span className="font-bold">
              {saving ? "Guardando..." : "Guardar cambios"}
            </span>
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-blue-gray-600 py-4">Cargando…</div>
        ) : (
          <div className="flex flex-col gap-6 py-1">
            <BloqueResumenDocente
              p={f}
              estadoTxt={findLabel(cat.estados, f.estadoPersonaId)}
              categoriaTxt={findLabel(cat.categorias, f.categoriaId)}
              rolTxt={findLabel(cat.roles, f.rolDocenteId)}
              sedeTxt={findLabel(cat.sedes, f.sedeId)}
              periodoIngresoNombre={findLabel(cat.periodos, f.periodoIngresoId)}
              subtitle="Modifica la información del docente por secciones."
              showDirty={hasChanges}
            />

            <InformacionGeneralFields
              f={f}
              onChange={onChange}
              cat={cat}
              cantonesVisibles={cantonesVisibles}
              loadingCantones={loadingCantones}
              onProvinciaChange={onProvinciaChange}
            />

            <InformacionDocenteFields f={f} onChange={onChange} cat={cat} />

            <InformacionDesvinculacionFields f={f} onChange={onChange} cat={cat} />
          </div>
        )}
      </div>
    </AppModal>
  );
}

export { FichaDocente, AgregarDocente, EditarDocente };