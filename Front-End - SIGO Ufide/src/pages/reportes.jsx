// src/pages/reportes.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API = import.meta.env.VITE_API_BASE ?? "";
const API_URL = {
  personas: `${API}/api/personas`,
  ofertas: `${API}/api/ofertas`,
  coordinaciones: `${API}/api/coordinaciones`,
  periodos: `${API}/api/periodos`,
  motivos: `${API}/api/motivosdesvinculacion`,
};

const COLORS = ["#2B338C", "#FFDA00", "#F97316", "#0EA5E9", "#22C55E"];

// ===== estilos de menú como en Docentes =====
const MENU_CLS =
  "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";

const matches = (t, q) =>
  !q ||
  String(t ?? "")
    .toLowerCase()
    .includes(String(q ?? "").toLowerCase());

function getYearFromEtiqueta(etq) {
  if (!etq) return null;
  const m = /(\d{4})/.exec(String(etq));
  return m ? Number(m[1]) : null;
}

// mismo helper que en Docentes para etiquetas de periodo
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

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [personas, setPersonas] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [coordinaciones, setCoordinaciones] = useState([]);

  const [periodosCat, setPeriodosCat] = useState([]); 
  const [periodoMap, setPeriodoMap] = useState({});  
  const [motivoMap, setMotivoMap] = useState({});    

  // =============== FILTROS / SLICERS =================
  const [qSearch, setQSearch] = useState(""); // barra de búsqueda general
  const [fNombre, setFNombre] = useState("Todos");
  const [fProvincia, setFProvincia] = useState("Todas");
  const [fSede, setFSede] = useState("Todas");
  const [fPeriodo, setFPeriodo] = useState("Todos");
  const [fCoordinadorId, setFCoordinadorId] = useState("Todos");

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

      const arrPer = Array.isArray(jPer)
        ? jPer
        : jPer.data ?? jPer.items ?? jPer.result ?? jPer.results ?? [];
      const arrOf = Array.isArray(jOf)
        ? jOf
        : jOf.data ?? jOf.items ?? jOf.result ?? jOf.results ?? [];
      const arrCoo = Array.isArray(jCoo)
        ? jCoo
        : jCoo.data ?? jCoo.items ?? jCoo.result ?? jCoo.results ?? [];
      const arrPerCat = Array.isArray(jPerCat)
        ? jPerCat
        : jPerCat.data ?? jPerCat.items ?? jPerCat.result ?? jPerCat.results ?? [];
      const arrMot = Array.isArray(jMot)
        ? jMot
        : jMot.data ?? jMot.items ?? jMot.result ?? jMot.results ?? [];

      setPersonas(Array.isArray(arrPer) ? arrPer : []);
      setOfertas(Array.isArray(arrOf) ? arrOf : []);
      setCoordinaciones(Array.isArray(arrCoo) ? arrCoo : []);

      // catálogo de periodos (todos)
      const perList = (Array.isArray(arrPerCat) ? arrPerCat : []).map((x) => {
        const id = String(x.periodoId ?? x.id ?? x.Id ?? x.ID);
        const nombre = buildPeriodoLabel(x);
        return { id, nombre, __raw: x };
      });
      perList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setPeriodosCat(perList);
      const pMap = {};
      perList.forEach((p) => {
        pMap[String(p.id)] = p.nombre;
      });
      setPeriodoMap(pMap);

      // catálogo de motivos
      const mMap = {};
      (Array.isArray(arrMot) ? arrMot : []).forEach((m) => {
        const id = String(
          m.motivoDesvinculacionId ?? m.id ?? m.Id ?? m.ID
        );
        const nombre = String(
          m.motivo ?? m.nombre ?? m.descripcion ?? ""
        );
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

  // =================== CATÁLOGOS PARA DROPDOWNS ===================

  // Nombres de docentes
  const nombres = useMemo(() => {
    const set = new Set();
    personas.forEach((p) => {
      const nombreCompleto = `${p.primerApellido ?? ""} ${
        p.segundoApellido ?? ""
      } ${p.nombre ?? ""}`
        .replace(/\s+/g, " ")
        .trim();
      if (nombreCompleto) set.add(nombreCompleto);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [personas]);

  // Provincias
  const provincias = useMemo(() => {
    const set = new Set();
    personas.forEach((p) => {
      const prov =
        p.provinciaNombre ??
        p.provincia ??
        p.Provincia ??
        p.provinciaDescripcion ??
        "";
      const v = String(prov).trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [personas]);

  // Sedes
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

  // Periodos
  const periodos = useMemo(
    () => periodosCat.map((p) => p.nombre),
    [periodosCat]
  );

  // Coordinadores (
  const coordinadores = useMemo(() => {
    const personaMap = new Map(); 
    personas.forEach((p) => {
      const nombreCompleto = `${p.primerApellido ?? ""} ${
        p.segundoApellido ?? ""
      } ${p.nombre ?? ""}`
        .replace(/\s+/g, " ")
        .trim();
      personaMap.set(p.personaId ?? p.id, nombreCompleto || p.nombre || "");
    });

    const usados = new Set();
    ofertas.forEach((o) => {
      if (o.coordinadorId != null) usados.add(o.coordinadorId);
    });

    const res = [];
    coordinaciones.forEach((c) => {
      const coordId = c.coordinacionId ?? c.id;
      if (usados.size && !usados.has(coordId)) return;
      const nom = personaMap.get(c.personaId) ?? `Persona ${c.personaId}`;
      res.push({ id: String(coordId), nombre: nom });
    });

    const uniqueMap = new Map();
    res.forEach((c) => uniqueMap.set(c.id, c));
    return Array.from(uniqueMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [personas, ofertas, coordinaciones]);

  const selectedCoordinadorNombre = useMemo(() => {
    if (fCoordinadorId === "Todos") return "";
    const c = coordinadores.find((x) => x.id === fCoordinadorId);
    return c?.nombre ?? "";
  }, [coordinadores, fCoordinadorId]);

  const selectedPeriodoTexto = fPeriodo === "Todos" ? "" : fPeriodo;
  const selectedSedeTexto = fSede === "Todas" ? "" : fSede;

  // ================== PERSONAS FILTRADAS ==================

  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      const nombreCompleto = `${p.primerApellido ?? ""} ${
        p.segundoApellido ?? ""
      } ${p.nombre ?? ""}`
        .replace(/\s+/g, " ")
        .trim();
      const ced = String(p.cedula ?? "").trim();

      const prov =
        p.provinciaNombre ??
        p.provincia ??
        p.Provincia ??
        p.provinciaDescripcion ??
        "";

      const sedePersona = String(p.sede ?? p.Sede ?? "").trim();

      const periodoIng =
        p.periodoIngresoEtiqueta ??
        p.periodoIngresoNombre ??
        p.periodoIngreso ??
        "";
      const periodoIngTrim = String(periodoIng).trim();

    
      const textoBusqueda = [
        nombreCompleto,
        ced,
        prov,
        sedePersona,
        periodoIngTrim,
        p.estado,
        p.tipoContrato,
        p.atestado,
        p.genero,
      ]
        .map((x) => x ?? "")
        .join(" ");

      if (!matches(textoBusqueda, qSearch)) return false;
      if (fNombre !== "Todos" && nombreCompleto !== fNombre) return false;
      if (fProvincia !== "Todas" && String(prov).trim() !== fProvincia)
        return false;
      if (fSede !== "Todas" && sedePersona !== fSede) return false;
      if (fPeriodo !== "Todos" && periodoIngTrim !== fPeriodo) return false;



      return true;
    });
  }, [personas, qSearch, fNombre, fProvincia, fSede, fPeriodo]);

  // ================== AGREGADOS GENERALES ==================

  const totalDocentes = filteredPersonas.length;

  const activos = useMemo(
    () =>
      filteredPersonas.filter(
        (p) => String(p.estado ?? "").toLowerCase() === "activo"
      ).length,
    [filteredPersonas]
  );

  const inactivos = useMemo(
    () =>
      filteredPersonas.filter(
        (p) => String(p.estado ?? "").toLowerCase() === "inactivo"
      ).length,
    [filteredPersonas]
  );

  const activosInactivosData = useMemo(
    () => [
      { name: "Activos", value: activos },
      { name: "Inactivos", value: inactivos },
    ],
    [activos, inactivos]
  );

  // Reporte por periodo de ingreso (Nómina)
  const periodoNominaData = useMemo(() => {
    const mapa = new Map();
    filteredPersonas.forEach((p) => {
      const etq =
        p.periodoIngresoEtiqueta ??
        p.periodoIngresoNombre ??
        p.periodoIngreso ??
        "";
      if (!etq) return;
      const key = String(etq).trim();
      mapa.set(key, (mapa.get(key) ?? 0) + 1);
    });
    return [...mapa.entries()].map(([name, value]) => ({
      name,
      value: Number(value ?? 0),
    }));
  }, [filteredPersonas]);

  // Grado Académico (Atestados)
  const atestadoData = useMemo(() => {
    const mapa = new Map();
    filteredPersonas.forEach((p) => {
      let a =
        p.atestadoNombre ??
        p.atestado ??
        p.gradoAcademico ??
        p.grado ??
        "Sin dato";
      a = String(a || "Sin dato").trim() || "Sin dato";
      mapa.set(a, (mapa.get(a) ?? 0) + 1);
    });
    return [...mapa.entries()].map(([name, value]) => ({
      name,
      value: Number(value ?? 0),
    }));
  }, [filteredPersonas]);

  // Género
  const generoData = useMemo(() => {
    const mapa = new Map();
    filteredPersonas.forEach((p) => {
      let g = p.genero ?? p.generoNombre ?? "";
      g = String(g || "Sin dato").trim() || "Sin dato";
      mapa.set(g, (mapa.get(g) ?? 0) + 1);
    });
    return [...mapa.entries()].map(([name, value]) => ({
      name,
      value: Number(value ?? 0),
    }));
  }, [filteredPersonas]);

  // Planilla vs Honorarios
  const contratoData = useMemo(() => {
    let planilla = 0;
    let honorarios = 0;

    filteredPersonas.forEach((p) => {
      const t = String(p.tipoContrato ?? "").toLowerCase();
      if (t.includes("planilla")) planilla++;
      else if (t.includes("honorario")) honorarios++;
    });

    return [
      { name: "Planilla", value: planilla },
      { name: "Honorarios", value: honorarios },
    ];
  }, [filteredPersonas]);

  // +4 años de permanencia
  const permanenciaMayor4 = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const rows = [];

    filteredPersonas.forEach((p) => {
      const etqIng =
        p.periodoIngresoEtiqueta ??
        p.periodoIngresoNombre ??
        p.periodoIngreso ??
        "";
      const etqDesv =
        p.periodoDesvinculacionEtiqueta ??
        p.periodoDesvinculacionNombre ??
        (p.periodoDesvinculacionId != null
          ? periodoMap[String(p.periodoDesvinculacionId)] ?? ""
          : "") ??
        p.periodoDesvinculacion ??
        "";

      const yIng = getYearFromEtiqueta(etqIng);
      const yDesv = etqDesv ? getYearFromEtiqueta(etqDesv) : currentYear;

      if (!yIng) return;
      const diff = (yDesv ?? currentYear) - yIng;
      if (diff >= 4) {
        const nombreCompleto = `${p.primerApellido ?? ""} ${
          p.segundoApellido ?? ""
        } ${p.nombre ?? ""}`.replace(/\s+/g, " ").trim();

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
  }, [filteredPersonas, periodoMap]);

  // ================== NÓMINA (vista tipo Excel) ==================

  const [showNomina, setShowNomina] = useState(false);

  const nominaRows = useMemo(() => {
    return filteredPersonas
      .map((p) => {
        const nombreCompleto = `${p.primerApellido ?? ""} ${
          p.segundoApellido ?? ""
        } ${p.nombre ?? ""}`
          .replace(/\s+/g, " ")
          .trim();

        const ingreso =
          p.periodoIngresoEtiqueta ??
          p.periodoIngresoNombre ??
          p.periodoIngreso ??
          "";

        const salida =
          p.periodoDesvinculacionEtiqueta ??
          p.periodoDesvinculacionNombre ??
          (p.periodoDesvinculacionId != null
            ? periodoMap[String(p.periodoDesvinculacionId)] ?? ""
            : "") ??
          p.periodoDesvinculacion ??
          "";

        const motivo =
          p.motivoDesvinculacionNombre ??
          p.motivoDesvinculacion ??
          p.motivo ??
          (p.motivoDesvinculacionId != null
            ? motivoMap[String(p.motivoDesvinculacionId)] ?? ""
            : "");

        const estadoTxt =
          typeof p.estado === "boolean"
            ? p.estado
              ? "Activo"
              : "Inactivo"
            : p.estado ?? p.estadoPersona ?? "";

        return {
          id: p.personaId ?? p.id,
          nombre: nombreCompleto || p.nombre || "",
          ingreso,
          salida,
          estado: estadoTxt,
          motivo,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [filteredPersonas, periodoMap, motivoMap]);

  // ====== EXPORTAR EXCEL (CSV con BOM UTF-8) ======
  const handleExportExcel = () => {
    const periodoTexto = selectedPeriodoTexto;
    const sedeTexto = selectedSedeTexto;
    const coordinacionTexto = selectedCoordinadorNombre;

    const lines = [];

    lines.push("NÓMINA DOCENTE");
    lines.push(
      `Escuela: Sistemas de Computación;Periodo: ${periodoTexto};`
    );
    lines.push(`Dirección:;Sede: ${sedeTexto};`);
    lines.push(`Subdirección:;Cant. Docentes activos: ${activos};`);
    lines.push(
      `Coordinación: ${coordinacionTexto};Cant. Docentes inactivos: ${inactivos};`
    );
    lines.push("");
    lines.push(
      "Nombre del docente;Periodo de ingreso;Periodo de desvinculación;Estado actual;Motivo de desvinculación"
    );

    nominaRows.forEach((r) => {
      lines.push(
        `${r.nombre};${r.ingreso};${r.salida};${r.estado};${r.motivo}`
      );
    });

    const csv = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "NominaDocente.csv";
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  };

  // ====== EXPORTAR PDF (vista nómina) ======
  const handleExportPdf = () => {
    const el = document.getElementById("nomina-print-area");
    if (!el) {
      alert("No se encontró la sección de nómina para imprimir.");
      return;
    }

    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Nómina Docente</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h1 { text-align: center; font-size: 20px; margin-bottom: 8px; }
            table { border-collapse: collapse; width: 100%; margin-top: 8px; }
            th, td { border: 1px solid #000; padding: 4px 6px; font-size: 12px; }
            .row { display:flex; justify-content:space-between; font-size: 12px; margin-bottom: 2px; }
            .header-box { border:1px solid #000; padding:8px; margin-bottom:8px; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
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

      {/* Slicers horizontales */}
      <Card className="p-3 overflow-visible relative z-50 flex flex-col xl:flex-row xl:items-end gap-3 justify-between">
        <div className="flex flex-col lg:flex-row gap-3 flex-1">
          {/* Barra de búsqueda general */}
          <div className="flex-1 min-w-[220px]">
            <Input
              label="Buscar (nombre, cédula, otros campos)"
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
              crossOrigin=""
              size="md"
            />
          </div>

          {/* Nombre */}
          <div className="min-w-[220px]">
            <Select
              label="Nombre del docente"
              value={fNombre}
              onChange={(v) => setFNombre(v || "Todos")}
              selected={() => (fNombre === "Todos" ? "Todos" : fNombre)}
              size="md"
              menuProps={{
                className: MENU_CLS,
                keepMounted: true,
                placement: "bottom-start",
              }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todos">Todos</Option>
              {nombres.map((n) => (
                <Option key={n} value={n} className="bg-white">
                  {n}
                </Option>
              ))}
            </Select>
          </div>

          {/* Provincia */}
          <div className="min-w-[180px]">
            <Select
              label="Provincia"
              value={fProvincia}
              onChange={(v) => setFProvincia(v || "Todas")}
              selected={() =>
                fProvincia === "Todas" ? "Todas" : fProvincia
              }
              size="md"
              menuProps={{
                className: MENU_CLS,
                keepMounted: true,
                placement: "bottom-start",
              }}
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

          {/* Sede */}
          <div className="min-w-[160px]">
            <Select
              label="Sede"
              value={fSede}
              onChange={(v) => setFSede(v || "Todas")}
              selected={() => (fSede === "Todas" ? "Todas" : fSede)}
              size="md"
              menuProps={{
                className: MENU_CLS,
                keepMounted: true,
                placement: "bottom-start",
              }}
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

          {/* Periodo de ingreso */}
          <div className="min-w-[180px]">
            <Select
              label="Periodo de ingreso"
              value={fPeriodo}
              onChange={(v) => setFPeriodo(v || "Todos")}
              selected={() =>
                fPeriodo === "Todos" ? "Todos" : fPeriodo
              }
              size="md"
              menuProps={{
                className: MENU_CLS,
                keepMounted: true,
                placement: "bottom-start",
              }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todos">Todos</Option>
              {periodos.map((p) => (
                <Option key={p} value={p} className="bg-white">
                  {p}
                </Option>
              ))}
            </Select>
          </div>

          {/* Coordinador */}
          <div className="min-w-[200px]">
            <Select
              label="Coordinador"
              value={fCoordinadorId}
              onChange={(v) => setFCoordinadorId(v || "Todos")}
              selected={() =>
                fCoordinadorId === "Todos"
                  ? "Todos"
                  : coordinadores.find((c) => c.id === fCoordinadorId)
                      ?.nombre ?? "Todos"
              }
              size="md"
              menuProps={{
                className: MENU_CLS,
                keepMounted: true,
                placement: "bottom-start",
              }}
              containerProps={{ className: CONT_CLS }}
            >
              <Option value="Todos">Todos</Option>
              {coordinadores.map((c) => (
                <Option key={c.id} value={c.id} className="bg-white">
                  {c.nombre}
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
              setFNombre("Todos");
              setFProvincia("Todas");
              setFSede("Todas");
              setFPeriodo("Todos");
              setFCoordinadorId("Todos");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {/* Resumen numérico */}
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

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Docentes activos / inactivos */}
        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Docentes activos vs inactivos
          </Typography>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Cargando…
            </div>
          ) : err ? (
            <div className="h-52 flex items-center justify-center text-red-500">
              {err}
            </div>
          ) : (
            <div className="h-52 min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={200}
                minHeight={200}
              >
                <PieChart>
                  <Pie
                    data={activosInactivosData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={70}
                    label
                  >
                    {activosInactivosData.map((entry, index) => (
                      <Cell
                        key={`cell-ai-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Grado Académico (Atestados) */}
        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Grado académico (Atestados)
          </Typography>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Cargando…
            </div>
          ) : err ? (
            <div className="h-52 flex items-center justify-center text-red-500">
              {err}
            </div>
          ) : atestadoData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Sin datos de atestados.
            </div>
          ) : (
            <div className="h-52 min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={200}
                minHeight={200}
              >
                <BarChart data={atestadoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Docentes">
                    {atestadoData.map((entry, index) => (
                      <Cell
                        key={`cell-at-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Más gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Periodo ingreso */}
        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Reporte por periodo de ingreso
          </Typography>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Cargando…
            </div>
          ) : err ? (
            <div className="h-52 flex items-center justify-center text-red-500">
              {err}
            </div>
          ) : periodoNominaData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Sin datos de periodo de ingreso.
            </div>
          ) : (
            <div className="h-52 min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={200}
                minHeight={200}
              >
                <BarChart data={periodoNominaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Docentes">
                    {periodoNominaData.map((entry, index) => (
                      <Cell
                        key={`cell-per-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Género */}
        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Distribución por género
          </Typography>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Cargando…
            </div>
          ) : err ? (
            <div className="h-52 flex items-center justify-center text-red-500">
              {err}
            </div>
          ) : generoData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Sin datos de género.
            </div>
          ) : (
            <div className="h-52 min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={200}
                minHeight={200}
              >
                <PieChart>
                  <Pie
                    data={generoData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    label
                  >
                    {generoData.map((entry, index) => (
                      <Cell
                        key={`cell-gen-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Planilla vs Honorarios */}
        <Card className="p-4">
          <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
            Cantidad de Planilla vs Honorarios
          </Typography>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-blue-gray-400">
              Cargando…
            </div>
          ) : err ? (
            <div className="h-52 flex items-center justify-center text-red-500">
              {err}
            </div>
          ) : (
            <div className="h-52 min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={200}
                minHeight={200}
              >
                <BarChart data={contratoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Docentes">
                    {contratoData.map((entry, index) => (
                      <Cell
                        key={`cell-ct-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* +4 años de permanencia */}
      <Card className="p-4">
        <Typography className="text-sm font-semibold text-blue-gray-700 mb-2">
          Docentes con más de 4 años de permanencia
        </Typography>
        {permanenciaMayor4.length === 0 ? (
          <div className="text-blue-gray-400 text-sm">
            No hay docentes con más de 4 años según los periodos de ingreso /
            desvinculación.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left text-sm">
              <thead>
                <tr className="bg-blue-gray-50 text-blue-gray-700">
                  <th className="p-2 font-semibold">Nombre del docente</th>
                  <th className="p-2 font-semibold">Periodo de ingreso</th>
                  <th className="p-2 font-semibold">
                    Periodo de desvinculación
                  </th>
                  <th className="p-2 font-semibold">Años de permanencia</th>
                </tr>
              </thead>
              <tbody>
                {permanenciaMayor4.map((r) => (
                  <tr key={r.personaId} className="border-b">
                    <td className="p-2">{r.nombre}</td>
                    <td className="p-2">{r.periodoIngreso}</td>
                    <td className="p-2">
                      {r.periodoDesvinculacion || "—"}
                    </td>
                    <td className="p-2">{r.anios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* NÓMINA – vista + exportar */}
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
          <div
            id="nomina-print-area"
            className="border border-blue-gray-200 rounded-md p-4 space-y-3 bg-white"
          >
            {/* Encabezado tipo planilla */}
            <div className="space-y-1 text-xs">
              <Typography className="text-center font-bold text-base">
                NÓMINA DOCENTE
              </Typography>
              <div className="flex justify-between">
                <span>Escuela: Sistemas de Computación</span>
                <span>Periodo: {selectedPeriodoTexto}</span>
              </div>
              <div className="flex justify-between">
                <span>Dirección:</span>
                <span>Sede: {selectedSedeTexto}</span>
              </div>
              <div className="flex justify-between">
                <span>Subdirección:</span>
                <span>{`Cant. Docentes activos: ${activos}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinación: {selectedCoordinadorNombre}</span>
                <span>{`Cant. Docentes inactivos: ${inactivos}`}</span>
              </div>
            </div>

            {/* Tabla */}
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[700px] w-full text-left text-xs border border-blue-gray-200">
                <thead>
                  <tr className="bg-[#2B338C] text-white">
                    <th className="border border-blue-gray-200 p-2">
                      Nombre del docente
                    </th>
                    <th className="border border-blue-gray-200 p-2">
                      Periodo de ingreso
                    </th>
                    <th className="border border-blue-gray-200 p-2">
                      Periodo de desvinculación
                    </th>
                    <th className="border border-blue-gray-200 p-2">
                      Estado actual
                    </th>
                    <th className="border border-blue-gray-200 p-2">
                      Motivo de desvinculación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nominaRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-blue-gray-200 p-2 text-center"
                      >
                        Sin registros.
                      </td>
                    </tr>
                  ) : (
                    nominaRows.map((r, idx) => (
                      <tr
                        key={r.id}
                        className={
                          idx % 2 === 0 ? "bg-white" : "bg-blue-gray-50"
                        }
                      >
                        <td className="border border-blue-gray-200 p-2">
                          {r.nombre}
                        </td>
                        <td className="border border-blue-gray-200 p-2">
                          {r.ingreso}
                        </td>
                        <td className="border border-blue-gray-200 p-2">
                          {r.salida || "—"}
                        </td>
                        <td className="border border-blue-gray-200 p-2">
                          {r.estado}
                        </td>
                        <td className="border border-blue-gray-200 p-2">
                          {r.motivo || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
