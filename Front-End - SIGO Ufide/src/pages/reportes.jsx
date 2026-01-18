import { useEffect, useState, useMemo } from "react";
import {Card,Typography,Button,Input,Select,Option,
} from "@material-tailwind/react";
import {PieChart,Pie,Cell,Tooltip,Legend,ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,
} from "recharts";

const API = import.meta.env.VITE_API_BASE ?? "";
const API_URL = {
  personas: `${API}/api/personas`,
  ofertas: `${API}/api/ofertas`,
  coordinaciones: `${API}/api/coordinaciones`,
  periodos: `${API}/api/periodos`,
  motivos: `${API}/api/motivosdesvinculacion`,

  // Nómina
  nominaExcel: `${API}/api/nomina/docentes/excel`,
  nominaPdf: `${API}/api/nomina/docentes/pdf`,

  // Permanencia +4
  permanenciaExcel: `${API}/api/nomina/docentes/permanencia4/excel`,
  permanenciaPdf: `${API}/api/nomina/docentes/permanencia4/pdf`,
};

const COLORS = ["#2B338C", "#FFDA00", "#F97316", "#0EA5E9", "#22C55E"];

const MENU_CLS =
  "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";

const matches = (t, q) =>
  !q ||
  String(t ?? "")
    .toLowerCase()
    .includes(String(q ?? "").toLowerCase());

const isBlankOrSinDato = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return true;
  return ["sin dato", "s/d", "sd", "n/a", "na"].includes(s);
};

function getYearFromEtiqueta(etq) {
  if (!etq) return null;
  const m = /(\d{4})/.exec(String(etq));
  return m ? Number(m[1]) : null;
}

function parsePeriodoEtiqueta(etq) {
  const s = String(etq ?? "").trim();
  const upper = s.toUpperCase();
  const year = getYearFromEtiqueta(upper);

  let ciclo = null;
  let m = /(\d)\s*C\b/.exec(upper);
  if (m) ciclo = Number(m[1]);
  if (ciclo == null) {
    m = /\bC\s*(\d)\b/.exec(upper);
    if (m) ciclo = Number(m[1]);
  }
  if (ciclo == null) ciclo = 99;

  return { year: year ?? 9999, ciclo, label: s };
}

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

function getFilenameFromContentDisposition(cd) {
  if (!cd) return null;

  let m = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
  if (m?.[1]) return decodeURIComponent(m[1].trim());

  m = /filename\s*=\s*"([^"]+)"/i.exec(cd);
  if (m?.[1]) return m[1].trim();

  m = /filename\s*=\s*([^;]+)/i.exec(cd);
  if (m?.[1]) return m[1].trim();

  return null;
}

async function postAndDownload(url, payload, fallbackName = "export.bin") {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Export failed: ${res.status} ${txt}`);
  }

  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") || "";
  const filename = getFilenameFromContentDisposition(cd) || fallbackName;

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [personas, setPersonas] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [coordinaciones, setCoordinaciones] = useState([]);

  const [periodosCat, setPeriodosCat] = useState([]);
  const [periodoMap, setPeriodoMap] = useState({});
  const [motivoMap, setMotivoMap] = useState({});

  // ===== FILTROS GLOBALES (SOLO KPIs / GRÁFICOS) =====
  const [qSearch, setQSearch] = useState("");
  const [fProvincia, setFProvincia] = useState("Todas");
  const [fSede, setFSede] = useState("Todas");

  // ===== UI =====
  const [showNomina, setShowNomina] = useState(false);
  const [showPermanencia, setShowPermanencia] = useState(false);

  // ===== NÓMINA: ENCABEZADO (NO depende de filtros globales) =====
  const [nomEscuela, setNomEscuela] = useState("");
  const [nomDireccion, setNomDireccion] = useState("");
  const [nomSubdireccion, setNomSubdireccion] = useState("");
  const [nomCoordinacion, setNomCoordinacion] = useState("");
  const [nomSede, setNomSede] = useState("Todas"); 
  const [nomPeriodoId, setNomPeriodoId] = useState("");

  const periodoTexto = useMemo(() => {
    if (!nomPeriodoId) return "";
    return periodoMap[String(nomPeriodoId)] ?? "";
  }, [nomPeriodoId, periodoMap]);

  const loadData = async () => {
    setLoading(true);
    setErr("");
    try {
      const [rPer, rOf, rCoo, rPerCat, rMot] = await Promise.all([
        fetch(API_URL.personas),
        fetch(API_URL.ofertas),
        fetch(API_URL.coordinaciones),
        fetch(API_URL.periodos),
        fetch(API_URL.motivos),
      ]);

      if (!rPer.ok) throw new Error("GET /api/personas");
      if (!rOf.ok) throw new Error("GET /api/ofertas");
      if (!rCoo.ok) throw new Error("GET /api/coordinaciones");
      if (!rPerCat.ok) throw new Error("GET /api/periodos");
      if (!rMot.ok) throw new Error("GET /api/motivosdesvinculacion");

      const jPer = await rPer.json();
      const jOf = await rOf.json();
      const jCoo = await rCoo.json();
      const jPerCat = await rPerCat.json();
      const jMot = await rMot.json();

      const arrPer = Array.isArray(jPer) ? jPer : jPer.data ?? jPer.items ?? jPer.result ?? jPer.results ?? [];
      const arrOf = Array.isArray(jOf) ? jOf : jOf.data ?? jOf.items ?? jOf.result ?? jOf.results ?? [];
      const arrCoo = Array.isArray(jCoo) ? jCoo : jCoo.data ?? jCoo.items ?? jCoo.result ?? jCoo.results ?? [];
      const arrPerCat = Array.isArray(jPerCat) ? jPerCat : jPerCat.data ?? jPerCat.items ?? jPerCat.result ?? jPerCat.results ?? [];
      const arrMot = Array.isArray(jMot) ? jMot : jMot.data ?? jMot.items ?? jMot.result ?? jMot.results ?? [];

      setPersonas(Array.isArray(arrPer) ? arrPer : []);
      setOfertas(Array.isArray(arrOf) ? arrOf : []);
      setCoordinaciones(Array.isArray(arrCoo) ? arrCoo : []);

      const perList = (Array.isArray(arrPerCat) ? arrPerCat : []).map((x) => {
        const id = String(x.periodoId ?? x.id ?? x.Id ?? x.ID);
        const nombre = buildPeriodoLabel(x);
        return { id, nombre, __raw: x };
      });
      perList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setPeriodosCat(perList);

      const pMap = {};
      perList.forEach((p) => (pMap[String(p.id)] = p.nombre));
      setPeriodoMap(pMap);

      const mMap = {};
      (Array.isArray(arrMot) ? arrMot : []).forEach((m) => {
        const id = String(m.motivoDesvinculacionId ?? m.id ?? m.Id ?? m.ID);
        const nombre = String(m.motivo ?? m.nombre ?? m.descripcion ?? "");
        if (id) mMap[id] = nombre;
      });
      setMotivoMap(mMap);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los datos de reportes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===== CATÁLOGOS =====
  const provincias = useMemo(() => {
    const set = new Set();
    personas.forEach((p) => {
      const prov = p.provinciaNombre ?? p.provincia ?? p.Provincia ?? p.provinciaDescripcion ?? "";
      const v = String(prov).trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [personas]);

  const sedes = useMemo(() => {
    const set = new Set();
    personas.forEach((p) => {
      const s = String(p.sede ?? p.Sede ?? "").trim();
      if (s) set.add(s);
    });
    ofertas.forEach((o) => {
      const s = String(o.sede ?? "").trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [personas, ofertas]);

  // =========================================================
  //  A) KPIs / GRÁFICOS -> USAN FILTROS GLOBALES
  // =========================================================
  const reportPersonas = useMemo(() => {
    return personas.filter((p) => {
      const nombreCompleto = `${p.primerApellido ?? ""} ${p.segundoApellido ?? ""} ${p.nombre ?? ""}`.replace(/\s+/g, " ").trim();
      const ced = String(p.cedula ?? "").trim();
      const prov = p.provinciaNombre ?? p.provincia ?? p.Provincia ?? p.provinciaDescripcion ?? "";
      const sedePersona = String(p.sede ?? p.Sede ?? "").trim();
      const periodoIng = p.periodoIngresoEtiqueta ?? p.periodoIngresoNombre ?? p.periodoIngreso ?? "";
      const periodoIngTrim = String(periodoIng).trim();

      const textoBusqueda = [nombreCompleto, ced, prov, sedePersona, periodoIngTrim, p.estado, p.tipoContrato, p.atestado, p.genero]
        .map((x) => x ?? "")
        .join(" ");

      if (!matches(textoBusqueda, qSearch)) return false;
      if (fProvincia !== "Todas" && String(prov).trim() !== fProvincia) return false;
      if (fSede !== "Todas" && sedePersona !== fSede) return false;

      return true;
    });
  }, [personas, qSearch, fProvincia, fSede]);

  const totalDocentes = reportPersonas.length;

  const activos = useMemo(
    () => reportPersonas.filter((p) => String(p.estado ?? "").toLowerCase() === "activo").length,
    [reportPersonas]
  );

  const inactivos = useMemo(
    () => reportPersonas.filter((p) => String(p.estado ?? "").toLowerCase() === "inactivo").length,
    [reportPersonas]
  );

  const activosInactivosData = useMemo(
    () => [
      { name: "Activos", value: activos },
      { name: "Inactivos", value: inactivos },
    ],
    [activos, inactivos]
  );

  const periodoNominaData = useMemo(() => {
    const mapa = new Map();
    reportPersonas.forEach((p) => {
      const raw = p.periodoIngresoEtiqueta ?? p.periodoIngresoNombre ?? p.periodoIngreso ?? "";
      if (isBlankOrSinDato(raw)) return;
      const key = String(raw).trim();
      mapa.set(key, (mapa.get(key) ?? 0) + 1);
    });

    return [...mapa.entries()]
      .map(([name, value]) => ({ name, value: Number(value ?? 0) }))
      .filter((x) => !isBlankOrSinDato(x.name) && x.value > 0)
      .sort((a, b) => {
        const pa = parsePeriodoEtiqueta(a.name);
        const pb = parsePeriodoEtiqueta(b.name);
        if (pa.year !== pb.year) return pa.year - pb.year;
        if (pa.ciclo !== pb.ciclo) return pa.ciclo - pb.ciclo;
        return a.name.localeCompare(b.name);
      });
  }, [reportPersonas]);

  const atestadoData = useMemo(() => {
    const mapa = new Map();
    reportPersonas.forEach((p) => {
      const raw = p.atestadoNombre ?? p.atestado ?? p.gradoAcademico ?? p.grado ?? "";
      if (isBlankOrSinDato(raw)) return;
      const a = String(raw).trim();
      mapa.set(a, (mapa.get(a) ?? 0) + 1);
    });

    return [...mapa.entries()]
      .map(([name, value]) => ({ name, value: Number(value ?? 0) }))
      .filter((x) => !isBlankOrSinDato(x.name) && x.value > 0);
  }, [reportPersonas]);

  const generoData = useMemo(() => {
    const mapa = new Map();
    reportPersonas.forEach((p) => {
      const raw = p.genero ?? p.generoNombre ?? "";
      if (isBlankOrSinDato(raw)) return;
      const g = String(raw).trim();
      mapa.set(g, (mapa.get(g) ?? 0) + 1);
    });

    return [...mapa.entries()]
      .map(([name, value]) => ({ name, value: Number(value ?? 0) }))
      .filter((x) => !isBlankOrSinDato(x.name) && x.value > 0);
  }, [reportPersonas]);

  const contratoData = useMemo(() => {
    let planilla = 0;
    let honorarios = 0;

    reportPersonas.forEach((p) => {
      const t = String(p.tipoContrato ?? "").toLowerCase();
      if (t.includes("planilla")) planilla++;
      else if (t.includes("honorario")) honorarios++;
    });

    return [
      { name: "Planilla", value: planilla },
      { name: "Honorarios", value: honorarios },
    ];
  }, [reportPersonas]);

  // =========================================================
  //  B) NÓMINA y PERMANENCIA -> NO usan filtros globales
  // =========================================================

  const nominaRows = useMemo(() => {
    return (personas ?? [])
      .map((p) => {
        const nombreCompleto = `${p.primerApellido ?? ""} ${p.segundoApellido ?? ""} ${p.nombre ?? ""}`.replace(/\s+/g, " ").trim();

        const ingreso = p.periodoIngresoEtiqueta ?? p.periodoIngresoNombre ?? p.periodoIngreso ?? "";

        const salida =
          p.periodoDesvinculacionEtiqueta ??
          p.periodoDesvinculacionNombre ??
          (p.periodoDesvinculacionId != null ? periodoMap[String(p.periodoDesvinculacionId)] ?? "" : "") ??
          p.periodoDesvinculacion ??
          "";

        const motivo =
          p.motivoDesvinculacionNombre ??
          p.motivoDesvinculacion ??
          p.motivo ??
          (p.motivoDesvinculacionId != null ? motivoMap[String(p.motivoDesvinculacionId)] ?? "" : "");

        const estadoTxt =
          typeof p.estado === "boolean"
            ? p.estado ? "Activo" : "Inactivo"
            : p.estado ?? p.estadoPersona ?? "";

        const sedeTxt = String(p.sede ?? p.Sede ?? "").trim();

        return {
          id: p.personaId ?? p.id,
          nombre: nombreCompleto || p.nombre || "",
          ingreso,
          salida,
          estado: estadoTxt,
          motivo,
          sede: sedeTxt,
        };
      })
      .sort((a, b) => {
        const rank = (estado) => {
          const s = String(estado ?? "").trim().toLowerCase();
          if (/^inactivo\b/.test(s)) return 1;
          if (/^activo\b/.test(s)) return 0;
          return 2;
        };
        const ra = rank(a.estado);
        const rb = rank(b.estado);
        if (ra !== rb) return ra - rb;
        return a.nombre.localeCompare(b.nombre);
      });
  }, [personas, periodoMap, motivoMap]);

  const nominaDisplayRows = useMemo(() => {
    if (!nomSede || nomSede === "Todas") return nominaRows;
    return nominaRows.filter((r) => String(r.sede ?? "").trim() === String(nomSede).trim());
  }, [nominaRows, nomSede]);

  const nominaActivos = useMemo(
    () => nominaDisplayRows.filter((r) => String(r.estado ?? "").toLowerCase() === "activo").length,
    [nominaDisplayRows]
  );

  const nominaInactivos = useMemo(
    () => nominaDisplayRows.filter((r) => String(r.estado ?? "").toLowerCase() === "inactivo").length,
    [nominaDisplayRows]
  );

  const permanenciaMayor4 = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const rows = [];

    (personas ?? []).forEach((p) => {
      const etqIng = p.periodoIngresoEtiqueta ?? p.periodoIngresoNombre ?? p.periodoIngreso ?? "";

      const etqDesv =
        p.periodoDesvinculacionEtiqueta ??
        p.periodoDesvinculacionNombre ??
        (p.periodoDesvinculacionId != null ? periodoMap[String(p.periodoDesvinculacionId)] ?? "" : "") ??
        p.periodoDesvinculacion ??
        "";

      const yIng = getYearFromEtiqueta(etqIng);
      const yDesv = etqDesv ? getYearFromEtiqueta(etqDesv) : currentYear;

      if (!yIng) return;
      const diff = (yDesv ?? currentYear) - yIng;

      if (diff >= 4) {
        const nombreCompleto = `${p.primerApellido ?? ""} ${p.segundoApellido ?? ""} ${p.nombre ?? ""}`.replace(/\s+/g, " ").trim();
        rows.push({
          personaId: p.personaId ?? p.id,
          nombre: nombreCompleto || p.nombre || "",
          periodoIngreso: etqIng,
          periodoDesvinculacion: etqDesv || "",
          anios: diff,
        });
      }
    });

    rows.sort((a, b) => b.anios - a.anios);
    return rows;
  }, [personas, periodoMap]);

  // ===== Payloads =====
  const buildNominaPayload = () => ({
    meta: {
      escuela: nomEscuela,
      direccion: nomDireccion,
      subdireccion: nomSubdireccion,
      coordinacion: nomCoordinacion,
      sede: nomSede,
      periodo: periodoTexto,
      cantActivos: nominaActivos,
      cantInactivos: nominaInactivos,
    },
    rows: nominaDisplayRows.map((r) => ({
      nombreCompleto: r.nombre,
      periodoIngreso: r.ingreso ?? "",
      periodoDesvinculacion: r.salida ?? "",
      estado: r.estado ?? "",
      motivoDesvinculacion: r.motivo ?? "",
    })),
  });

  const buildPermanenciaPayload = () => ({
    meta: {
      totalRegistros: permanenciaMayor4.length,
    },
    rows: permanenciaMayor4.map((r) => ({
      nombreCompleto: r.nombre,
      periodoIngreso: r.periodoIngreso ?? "",
      periodoDesvinculacion: r.periodoDesvinculacion ?? "",
      aniosPermanencia: Number(r.anios ?? 0),
    })),
  });

  // ===== Export Nómina =====
  const handleExportExcel = async () => {
    try {
      await postAndDownload(API_URL.nominaExcel, buildNominaPayload(), "Nomina_Docentes.xlsx");
    } catch (e) {
      console.error(e);
      alert("No se pudo exportar Excel.");
    }
  };

  const handleExportPdf = async () => {
    try {
      await postAndDownload(API_URL.nominaPdf, buildNominaPayload(), "Nomina_Docentes.pdf");
    } catch (e) {
      console.error(e);
      alert("No se pudo exportar PDF.");
    }
  };

  // ===== Export Permanencia +4 =====
  const handleExportPermanenciaExcel = async () => {
    try {
      await postAndDownload(
        API_URL.permanenciaExcel,
        buildPermanenciaPayload(),
        "Docentes_Permanencia4.xlsx"
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo exportar Excel (+4 años).");
    }
  };

  const handleExportPermanenciaPdf = async () => {
    try {
      await postAndDownload(
        API_URL.permanenciaPdf,
        buildPermanenciaPayload(),
        "Docentes_Permanencia4.pdf"
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo exportar PDF (+4 años).");
    }
  };

  // ======================= RENDER =======================
  return (
    <div className="p-2 md:p-6 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Reportes de Docentes
          </Typography>
          <Typography className="text-xs text-blue-gray-500">
            KPIs & Nómina
          </Typography>
        </div>

        <Button
          size="md"
          variant="outlined"
          className="border-[#2B338C] text-[#2B338C]"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {/* Slicers (SOLO KPIs / gráficos) */}
      <Card className="p-3 overflow-visible relative z-50 flex flex-col xl:flex-row xl:items-end gap-3 justify-between">
        <div className="flex flex-col lg:flex-row gap-3 flex-1">
          <div className="flex-1 min-w-[220px]">
            <Input
              label="Buscar (nombre, cédula, otros campos)"
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
              crossOrigin=""
              size="md"
            />
          </div>

          <div className="min-w-[180px]">
            <Select
              label="Provincia"
              value={fProvincia}
              onChange={(v) => setFProvincia(v || "Todas")}
              selected={() => (fProvincia === "Todas" ? "Todas" : fProvincia)}
              size="md"
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todas">Todas</Option>
              {provincias.map((p) => (
                <Option key={p} value={p} className="bg-white">
                  {p}
                </Option>
              ))}
            </Select>
          </div>

          <div className="min-w-[160px]">
            <Select
              label="Sede"
              value={fSede}
              onChange={(v) => setFSede(v || "Todas")}
              selected={() => (fSede === "Todas" ? "Todas" : fSede)}
              size="md"
              menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todas">Todas</Option>
              {sedes.map((s) => (
                <Option key={s} value={s} className="bg-white">
                  {s}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outlined"
            className="border-[#2B338C] text-[#2B338C]"
            size="md"
            onClick={() => {
              setQSearch("");
              setFProvincia("Todas");
              setFSede("Todas");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {/* Resumen numérico (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 flex flex-col gap-1">
          <Typography className="text-xs font-semibold text-blue-gray-500">
            TOTAL DOCENTES
          </Typography>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            {totalDocentes}
          </Typography>
        </Card>

        <Card className="p-4 flex flex-col gap-1">
          <Typography className="text-xs font-semibold text-blue-gray-500">
            ACTIVOS
          </Typography>
          <Typography className="text-2xl font-extrabold text-green-600">
            {activos}
          </Typography>
        </Card>

        <Card className="p-4 flex flex-col gap-1">
          <Typography className="text-xs font-semibold text-blue-gray-500">
            INACTIVOS
          </Typography>
          <Typography className="text-2xl font-extrabold text-red-600">
            {inactivos}
          </Typography>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Docentes activos vs inactivos
          </Typography>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Cargando…</div>
          ) : err ? (
            <div className="h-64 flex items-center justify-center text-red-500">{err}</div>
          ) : (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <PieChart>
                  <Pie data={activosInactivosData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {activosInactivosData.map((_, index) => (
                      <Cell key={`cell-ai-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Grado académico (Atestados)
          </Typography>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Cargando…</div>
          ) : err ? (
            <div className="h-64 flex items-center justify-center text-red-500">{err}</div>
          ) : atestadoData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Sin datos de atestados.</div>
          ) : (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <BarChart data={atestadoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Docentes">
                    {atestadoData.map((_, index) => (
                      <Cell key={`cell-at-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Reporte por periodo de ingreso
          </Typography>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Cargando…</div>
          ) : err ? (
            <div className="h-64 flex items-center justify-center text-red-500">{err}</div>
          ) : periodoNominaData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Sin datos.</div>
          ) : (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <BarChart data={periodoNominaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Docentes">
                    {periodoNominaData.map((_, index) => (
                      <Cell key={`cell-per-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Distribución por género
          </Typography>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Cargando…</div>
          ) : err ? (
            <div className="h-64 flex items-center justify-center text-red-500">{err}</div>
          ) : generoData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Sin datos.</div>
          ) : (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <PieChart>
                  <Pie data={generoData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                    {generoData.map((_, index) => (
                      <Cell key={`cell-gen-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Cantidad de Planilla vs Honorarios
          </Typography>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-blue-gray-400">Cargando…</div>
          ) : err ? (
            <div className="h-64 flex items-center justify-center text-red-500">{err}</div>
          ) : (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <BarChart data={contratoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Docentes">
                    {contratoData.map((_, index) => (
                      <Cell key={`cell-ct-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* +4 años (NO depende de filtros globales) */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Typography className="text-sm font-semibold text-blue-gray-700">
            Docentes con más de 4 años de permanencia
          </Typography>

          <div className="flex gap-2">
            <Button
              size="md"
              className="bg-[#2B338C] text-white"
              onClick={() => setShowPermanencia((v) => !v)}
            >
              {showPermanencia ? "Ocultar" : "VER DOCENTES + 4 AÑOS"}
            </Button>

            {showPermanencia && (
              <>
                <Button
                  size="md"
                  variant="outlined"
                  className="border-[#2B338C] text-[#2B338C]"
                  onClick={handleExportPermanenciaExcel}
                  disabled={permanenciaMayor4.length === 0}
                >
                  Exportar Excel
                </Button>
                <Button
                  size="md"
                  variant="outlined"
                  className="border-[#2B338C] text-[#2B338C]"
                  onClick={handleExportPermanenciaPdf}
                  disabled={permanenciaMayor4.length === 0}
                >
                  Exportar PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {!showPermanencia ? null : permanenciaMayor4.length === 0 ? (
          <div className="text-blue-gray-400 text-sm">
            No hay docentes con más de 4 años según los periodos de ingreso / desvinculación.
          </div>
        ) : (
          <div className="border border-blue-gray-200 rounded-md p-4 space-y-3 bg-white">
            <div className="space-y-1 text-xs">
              <Typography className="text-center font-bold text-base">
                DOCENTES CON MÁS DE 4 AÑOS DE PERMANENCIA
              </Typography>
              <div className="flex justify-between">
                <span>Total registros: {permanenciaMayor4.length}</span>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[700px] w-full text-left text-xs border border-blue-gray-200">
                <thead>
                  <tr className="bg-[#2B338C] text-white">
                    <th className="border border-blue-gray-200 p-2">Nombre del docente</th>
                    <th className="border border-blue-gray-200 p-2">Periodo de ingreso</th>
                    <th className="border border-blue-gray-200 p-2">Periodo de desvinculación</th>
                    <th className="border border-blue-gray-200 p-2">Años de permanencia</th>
                  </tr>
                </thead>
                <tbody>
                  {permanenciaMayor4.map((r, idx) => (
                    <tr key={r.personaId} className={idx % 2 === 0 ? "bg-white" : "bg-blue-gray-50"}>
                      <td className="border border-blue-gray-200 p-2">{r.nombre}</td>
                      <td className="border border-blue-gray-200 p-2">{r.periodoIngreso}</td>
                      <td className="border border-blue-gray-200 p-2">{r.periodoDesvinculacion || "—"}</td>
                      <td className="border border-blue-gray-200 p-2">{r.anios}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* NÓMINA (NO depende de filtros globales) */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Typography className="text-sm font-semibold text-blue-gray-700">
            Nómina docente (vista tipo reporte)
          </Typography>

          <div className="flex gap-2">
            <Button
              size="md"
              className="bg-[#2B338C] text-white"
              onClick={() => setShowNomina((v) => !v)}
            >
              {showNomina ? "Ocultar Nómina" : "Ver Nómina"}
            </Button>

            {showNomina && (
              <>
                <Button
                  size="md"
                  variant="outlined"
                  className="border-[#2B338C] text-[#2B338C]"
                  onClick={handleExportExcel}
                >
                  Exportar Excel
                </Button>
                <Button
                  size="md"
                  variant="outlined"
                  className="border-[#2B338C] text-[#2B338C]"
                  onClick={handleExportPdf}
                >
                  Exportar PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {showNomina && (
          <>
            <Card className="p-3 border border-blue-gray-200 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Escuela" value={nomEscuela} onChange={(e) => setNomEscuela(e.target.value)} crossOrigin="" />
                <Input label="Dirección" value={nomDireccion} onChange={(e) => setNomDireccion(e.target.value)} crossOrigin="" />
                <Input label="Subdirección" value={nomSubdireccion} onChange={(e) => setNomSubdireccion(e.target.value)} crossOrigin="" />

                <Input label="Coordinación" value={nomCoordinacion} onChange={(e) => setNomCoordinacion(e.target.value)} crossOrigin="" />

                <Select
                  label="Sede"
                  value={nomSede}
                  onChange={(v) => setNomSede(v || "Todas")}
                  selected={() => (nomSede || "Todas")}
                  menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                  containerProps={{ className: CONT_CLS }}
                >
                  <Option value="Todas">Todas</Option>
                  {sedes.map((s) => (
                    <Option key={s} value={s} className="bg-white">
                      {s}
                    </Option>
                  ))}
                </Select>

                <Select
                  label="Periodo"
                  value={nomPeriodoId}
                  onChange={(v) => setNomPeriodoId(v || "")}
                  selected={() => (periodoTexto || "Seleccione")}
                  menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                  containerProps={{ className: CONT_CLS }}
                >
                  <Option value="">Seleccione</Option>
                  {periodosCat.map((p) => (
                    <Option key={p.id} value={p.id} className="bg-white">
                      {p.nombre}
                    </Option>
                  ))}
                </Select>
              </div>
            </Card>

            <div className="border border-blue-gray-200 rounded-md p-4 space-y-3 bg-white">
              <div className="text-xs">
                <Typography className="text-center font-bold text-base">
                  NÓMINA DOCENTE
                </Typography>

                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                  <div className="space-y-1">
                    <div>Escuela: {nomEscuela || "—"}</div>
                    <div>Dirección: {nomDireccion || "—"}</div>
                    <div>Subdirección: {nomSubdireccion || "—"}</div>
                    <div>Coordinación: {nomCoordinacion || "—"}</div>
                  </div>

                  <div className="space-y-1 text-right">
                    <div>Sede: {nomSede || "Todas"}</div>
                    <div>Periodo: {periodoTexto || "—"}</div>
                    <div>Cant. Docentes activos: {nominaActivos}</div>
                    <div>Cant. Docentes inactivos: {nominaInactivos}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="min-w-[700px] w-full text-left text-xs border border-blue-gray-200">
                  <thead>
                    <tr className="bg-[#2B338C] text-white">
                      <th className="border border-blue-gray-200 p-2">Nombre del docente</th>
                      <th className="border border-blue-gray-200 p-2">Periodo de ingreso</th>
                      <th className="border border-blue-gray-200 p-2">Periodo de desvinculación</th>
                      <th className="border border-blue-gray-200 p-2">Estado actual</th>
                      <th className="border border-blue-gray-200 p-2">Motivo de desvinculación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nominaDisplayRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-blue-gray-200 p-2 text-center">
                          Sin registros.
                        </td>
                      </tr>
                    ) : (
                      nominaDisplayRows.map((r, idx) => (
                        <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-gray-50"}>
                          <td className="border border-blue-gray-200 p-2">{r.nombre}</td>
                          <td className="border border-blue-gray-200 p-2">{r.ingreso}</td>
                          <td className="border border-blue-gray-200 p-2">{r.salida || "—"}</td>
                          <td className="border border-blue-gray-200 p-2">{r.estado}</td>
                          <td className="border border-blue-gray-200 p-2">{r.motivo || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
