// src/pages/notificaciones/notificaciones.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import { useCatalogos } from "@/hooks/useCatalogos";
import { CatalogosNormalizados } from "@/hooks/CatalogosNormalizados";
import { OpenFichaOferta } from "@/pages/ofertas/functions";
import { accionChips, estadoChips } from "@/pages/ofertas/Components/EstadosAccionesChips";
import FichaOfertaModal from "@/pages/ofertas/modals/FichaOfertaModal";

import {
  Card,
  Typography,
  Chip,
  Input,
  Select,
  Option,
  Button,
  Tooltip,
} from "@material-tailwind/react";

import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { EyeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

/* ===================== Endpoints ===================== */
const NOTI_ENDPOINT = {
  list: (qs) => `/api/Notificaciones${qs ? `?${qs}` : ""}`,
  countNoLeidas: () => `/api/Notificaciones/count-no-leidas`,
  marcarLeida: (id) => `/api/Notificaciones/${id}/leida`,
  marcarTodasLeidas: () => `/api/Notificaciones/leidas`,
};

const OFERTA_ENDPOINT = {
  getById: (id) => `/api/Ofertas/${id}`,
};

/* ===================== UI helpers ===================== */
const MENU_CLS =
  "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";

/* ===================== Utils ===================== */
const safeJson = async (r) => {
  const txt = await r.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
};

const buildApiError = async (r) => {
  const j = await safeJson(r);
  if (!j) return `Error (${r.status})`;
  if (j.errors && typeof j.errors === "object") {
    const lines = [];
    for (const [k, arr] of Object.entries(j.errors)) {
      lines.push(`${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`);
    }
    return lines.join(" | ");
  }
  return j.title || j.detail || j.message || `Error (${r.status})`;
};

const formatDateTime = (isoLike) => {
  if (!isoLike) return "—";
  const d = new Date(String(isoLike).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(isoLike);
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
};

const statusFromMensaje = (m) => {
  const s = String(m || "").toUpperCase();

  if (s.includes("ACEPTÓ") || s.includes("ACEPTO") || s.includes("ACEPT"))
    return "aceptada";
  if (s.includes("RECHAZÓ") || s.includes("RECHAZO") || s.includes("RECHAZ"))
    return "rechazada";

  if (s.includes("ERROR")) return "error";
  if (s.includes("SE ENVIÓ") || s.includes("SE ENVIO") || s.includes("ENVIO"))
    return "enviada";

  return "info";
};

const statusMeta = {
  aceptada: {
    label: "Aceptada",
    Icon: CheckCircleIcon,
    tone: "bg-green-100 text-green-800",
  },
  rechazada: {
    label: "Rechazada",
    Icon: XCircleIcon,
    tone: "bg-red-100 text-red-800",
  },
  enviada: {
    label: "Enviada",
    Icon: PaperAirplaneIcon,
    tone: "bg-blue-100 text-blue-800",
  },
  error: {
    label: "Error",
    Icon: ExclamationTriangleIcon,
    tone: "bg-amber-100 text-amber-800",
  },
  info: {
    label: "Info",
    Icon: InformationCircleIcon,
    tone: "bg-blue-gray-100 text-blue-gray-800",
  },
};

/* ===================== Reglas permisos por modalidad (string) ===================== */

const PERM_VIRTUAL_100 = "OFERTAS_VIRTUALES_VIEW";
const PERM_PRESENCIAL_EN_LINEA = "OFERTAS_PRESENCIAL_EN_LINEA_VIEW";

const normalizeModalidad = (m) =>
  String(m || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes

const isAllowedByModalidad = (modalidadNorm, canVirtual100, canPresEnLinea, canBoth) => {
  if (canBoth) return true;
  if (!modalidadNorm) return false;

  // 100% virtuales
  if (modalidadNorm === "EN LINEA") return canVirtual100;

  // Presenciales y “virtual” (no 100%)
  if (modalidadNorm === "PRESENCIAL" || modalidadNorm === "VIRTUAL") return canPresEnLinea;

  // desconocida -> ocultar si no es admin
  return false;
};

/* ===================== Item UI ===================== */
function NotiItem({
  item,
  onAbrirOferta,
  onMarcarLeida,
  busy,
  disabled,
  tipoLoading,
}) {
  const meta = statusMeta[item.tipo] || statusMeta.info;
  const { Icon, tone, label } = meta;

  return (
    <Card
      className={`p-4 border ${item.leido ? "opacity-80" : ""} ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2 shrink-0" style={{ background: "#FFDA00" }}>
          <Icon className="h-6 w-6" style={{ color: "#2B338C" }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Typography className="font-semibold text-[#2B338C] truncate">
              Notificación #{item.notificacionId}
            </Typography>

            <Chip variant="ghost" value={label} className={`${tone} h-6 text-[12px]`} />

            {!item.leido && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#2B338C] text-white">
                Nuevo!
              </span>
            )}

            {tipoLoading && item.ofertaId && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-gray-50 text-blue-gray-700 border border-blue-gray-200">
                Cargando tipo...
              </span>
            )}

            {disabled && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                Sin permiso
              </span>
            )}
          </div>

          <Typography className="text-sm text-blue-gray-700 whitespace-pre-wrap">
            {item.mensaje || "—"}
          </Typography>

          <Typography className="text-xs text-blue-gray-400 mt-1">
            {item.fecha || "—"}
          </Typography>

          <div className="mt-3 grid grid-cols-1 sm:flex sm:items-center sm:gap-2">
            <Button
              size="sm"
              variant="outlined"
              className="w-full sm:w-auto border-[#2B338C] text-[#2B338C] flex items-center justify-center gap-2"
              onClick={() => onAbrirOferta(item)}
              disabled={!item.ofertaId || busy || disabled || tipoLoading}
            >
              <EyeIcon className="h-4 w-4" />
              Abrir oferta
            </Button>

            <Button
              size="sm"
              className="mt-2 sm:mt-0 w-full sm:w-auto bg-[#FFDA00] text-[#2B338C]"
              onClick={() => onMarcarLeida(item)}
              disabled={item.leido || busy || disabled || tipoLoading}
            >
              Marcar como leído
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ===================== Page ===================== */
export default function Notificaciones() {
  const { hasPermission } = useAuth();

  const canVirtual100 = hasPermission(PERM_VIRTUAL_100);
  const canPresEnLinea = hasPermission(PERM_PRESENCIAL_EN_LINEA);
  const canBoth = canVirtual100 && canPresEnLinea;

  /* -------- catálogos para el modal de ficha -------- */
  const {
    cursos,
    sedes,
    modalidades,
    horarios,
    periodos,
    coordinadores,
    estados,
    estadoOferta,
    personas,
    loading: loadingCatalogos,
    error: errorCatalogos,
  } = useCatalogos();

  const normalizadores = useMemo(() => {
    return CatalogosNormalizados({
      cursos,
      sedes,
      modalidades,
      horarios,
      periodos,
      coordinadores,
      estados,
      personas,
    });
  }, [cursos, sedes, modalidades, horarios, periodos, coordinadores, estados, personas]);

  const {
    matchCursoId,
    matchSedeId,
    matchModalidadId,
    matchHorarioId,
    matchPeriodoId,
    matchCoordinadorId,
    matchAccionIdDesdeEstadoOAccion,
  } = normalizadores;

  /* -------- filtros -------- */
  const [q, setQ] = useState("");
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);

  /* -------- paginación -------- */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  /* -------- data -------- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  /* -------- count no leídas -------- */
  const [countNoLeidas, setCountNoLeidas] = useState(0);

  /* -------- busy -------- */
  const [busyId, setBusyId] = useState(null);

  /* -------- debounce search -------- */
  const searchTimer = useRef(null);

  /* -------- modal ficha oferta -------- */
  const [openFicha, setOpenFicha] = useState(false);
  const [modo, setModo] = useState("ver");
  const [isNuevo, setIsNuevo] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [fichaId, setFichaId] = useState(null);
  const [fichaData, setFichaData] = useState(null);
  const [fichaForm, setFichaForm] = useState(null);
  const [fichaLoading, setFichaLoading] = useState(false);
  const [fichaError, setFichaError] = useState("");

  const OfertaCancelada =
    fichaForm?.estadoOfertaId === 5 ||
    fichaData?.estadoOfertaId === 5 ||
    (typeof fichaData?.estado === "string" &&
      fichaData.estado.toLowerCase().trim() === "cancelada");

  /* ===================== Mapa ofertaId -> modalidad (string) ===================== */
  const [ofertaModalidadMap, setOfertaModalidadMap] = useState(() => ({}));
  const [loadingTipos, setLoadingTipos] = useState(false);

  const getModalidadFromOferta = (ofertaJson) => {
    const m = ofertaJson?.modalidad ?? ofertaJson?.Modalidad ?? null;
    return m ? normalizeModalidad(m) : null;
  };

  // Concurrencia limitada
  const runWithConcurrency = async (tasks, limit = 6) => {
    const results = [];
    let idx = 0;

    const workers = new Array(Math.min(limit, tasks.length)).fill(0).map(async () => {
      while (idx < tasks.length) {
        const myIdx = idx++;
        results[myIdx] = await tasks[myIdx]();
      }
    });

    await Promise.all(workers);
    return results;
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (soloNoLeidas) params.set("soloNoLeidas", "true");
    if (q.trim()) params.set("search", q.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  };

  const loadNotis = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = buildQueryParams();
      const r = await fetch(NOTI_ENDPOINT.list(qs));
      if (!r.ok) throw new Error(await buildApiError(r));
      const j = await r.json();

      const arr = Array.isArray(j?.items) ? j.items : [];
      setItems(arr);
      setTotal(Number(j?.total ?? 0));
    } catch (e) {
      setError(String(e?.message || e));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadCountNoLeidas = async () => {
    try {
      const r = await fetch(NOTI_ENDPOINT.countNoLeidas());
      if (!r.ok) return;
      const n = await r.json();
      setCountNoLeidas(Number(n ?? 0));
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloNoLeidas, pageSize]);

  useEffect(() => {
    loadNotis();
    loadCountNoLeidas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloNoLeidas, page, pageSize]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadNotis();
    }, 350);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  /* normalizar items */
  const enriched = useMemo(() => {
    return (items || []).map((n) => {
      const notificacionId = n.notificacionId ?? n.NotificacionId ?? 0;
      const ofertaId = n.ofertaId ?? n.OfertaId ?? null;
      const solicitudOfertaId = n.solicitudOfertaId ?? n.SolicitudOfertaId ?? null;
      const leido = Boolean(n.leido ?? n.Leido ?? false);
      const mensaje = n.mensaje ?? n.Mensaje ?? "";
      const fecha = formatDateTime(
        n.fechaEvento ?? n.FechaEvento ?? n.fechaCreacion ?? n.FechaCreacion
      );

      return {
        notificacionId: Number(notificacionId),
        ofertaId: ofertaId ? Number(ofertaId) : null,
        solicitudOfertaId,
        leido,
        mensaje,
        fecha,
        tipo: statusFromMensaje(mensaje),
      };
    });
  }, [items]);

  /* ===================== Cargar modalidad de ofertas necesarias ===================== */
  useEffect(() => {
    const ofertaIds = Array.from(
      new Set(enriched.filter((n) => n.ofertaId).map((n) => n.ofertaId))
    );

    const missing = ofertaIds.filter((id) => ofertaModalidadMap[id] == null);
    if (missing.length === 0) return;

    let cancelled = false;

    const loadTipos = async () => {
      setLoadingTipos(true);
      try {
        const tasks = missing.map((id) => async () => {
          const r = await fetch(OFERTA_ENDPOINT.getById(id));
          if (!r.ok) return { id, modalidad: null };
          const j = await r.json();
          const modalidad = getModalidadFromOferta(j);
          return { id, modalidad };
        });

        const results = await runWithConcurrency(tasks, 6);

        if (cancelled) return;

        setOfertaModalidadMap((prev) => {
          const next = { ...prev };
          for (const x of results) next[x.id] = x.modalidad;
          return next;
        });
      } finally {
        if (!cancelled) setLoadingTipos(false);
      }
    };

    loadTipos();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enriched]);

  /* ===================== ✅ Filtrado por permisos usando modalidad string ===================== */
  const visibleNotis = useMemo(() => {
    if (canBoth) return enriched;

    // si no tiene ninguno de los 2 permisos, solo mostrar notis sin oferta asociada (si existieran)
    if (!canVirtual100 && !canPresEnLinea) return enriched.filter((n) => !n.ofertaId);

    return enriched.filter((n) => {
      if (!n.ofertaId) return true; // notificaciones generales

      const modalidad = ofertaModalidadMap[n.ofertaId];

      // mientras no sepamos modalidad, ocultar temporalmente
      if (modalidad == null) return false;

      return isAllowedByModalidad(modalidad, canVirtual100, canPresEnLinea, canBoth);
    });
  }, [enriched, canBoth, canVirtual100, canPresEnLinea, ofertaModalidadMap]);

  const visibleNoLeidasCount = useMemo(
    () => visibleNotis.filter((n) => !n.leido).length,
    [visibleNotis]
  );

  const totalPages = useMemo(() => {
    if (!total || !pageSize) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const canActOnNoti = (noti) => {
    if (canBoth) return true;
    if (!noti?.ofertaId) return true;

    const modalidad = ofertaModalidadMap[noti.ofertaId];
    if (modalidad == null) return false;

    return isAllowedByModalidad(modalidad, canVirtual100, canPresEnLinea, canBoth);
  };

  const marcarComoLeida = async (item) => {
    if (!item?.notificacionId) return;

    // bloqueo por permisos/tipo
    if (!canActOnNoti(item)) return;

    setBusyId(item.notificacionId);
    setError("");

    try {
      const r = await fetch(NOTI_ENDPOINT.marcarLeida(item.notificacionId), {
        method: "PATCH",
      });
      if (!r.ok) throw new Error(await buildApiError(r));

      setItems((prev) =>
        (prev || []).map((x) => {
          const id = x.notificacionId ?? x.NotificacionId;
          return String(id) === String(item.notificacionId) ? { ...x, leido: true } : x;
        })
      );

      loadCountNoLeidas();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyId(null);
    }
  };

  const marcarTodasComoLeidas = async () => {
    setBusyId("ALL");
    setError("");

    try {
      // si tiene ambos permisos, usar endpoint global
      if (canBoth) {
        const r = await fetch(NOTI_ENDPOINT.marcarTodasLeidas(), { method: "PATCH" });
        if (!r.ok) throw new Error(await buildApiError(r));
        await loadNotis();
        await loadCountNoLeidas();
        return;
      }

      // si no tiene ambos, marcar solo visibles + permitidas
      const targets = visibleNotis.filter((n) => !n.leido && canActOnNoti(n));
      for (const n of targets) {
        const r = await fetch(NOTI_ENDPOINT.marcarLeida(n.notificacionId), { method: "PATCH" });
        if (!r.ok) throw new Error(await buildApiError(r));
      }

      await loadNotis();
      await loadCountNoLeidas();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenFicha = async (id) => {
    if (!id) return;

    setModo("ver");
    setIsNuevo(false);
    setEditMode(false);

    setFichaId(id);
    setOpenFicha(true);
    setFichaLoading(true);
    setFichaError("");
    setFichaData(null);
    setFichaForm(null);

    const result = await OpenFichaOferta(id, {
      matchCursoId,
      matchSedeId,
      matchModalidadId,
      matchHorarioId,
      matchPeriodoId,
      matchCoordinadorId,
      matchAccionIdDesdeEstadoOAccion,
      estadoOferta,
    });

    if (!result?.ok) {
      setFichaError(result?.error || "No se pudo abrir la ficha de oferta.");
      setFichaLoading(false);
      return;
    }

    setFichaData(result.data);
    setFichaForm(result.fichaForm);
    setFichaLoading(false);
  };

  const handleCloseFicha = () => {
    setOpenFicha(false);
    setModo("ver");
    setIsNuevo(false);
    setEditMode(false);
    setFichaId(null);
    setFichaData(null);
    setFichaForm(null);
    setFichaError("");
    setFichaLoading(false);
  };

  const clearFilters = () => {
    setQ("");
    setSoloNoLeidas(false);
    setPage(1);
    setPageSize(20);
  };

  const showLoading = loading || loadingCatalogos;
  const fromIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIdx = Math.min(total, page * pageSize);

  const showOnlyByPerms = !canBoth;

  return (
    <div className="p-2 md:p-6 space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <Typography className="text-2xl font-extrabold text-[#2B338C]">
            Notificaciones
          </Typography>

          {(error || errorCatalogos) && (
            <Typography className="mt-2 text-sm text-red-600">
              {error || errorCatalogos}
            </Typography>
          )}

          {showOnlyByPerms && (
            <Typography className="mt-1 text-xs text-blue-gray-600">
              Mostrando solo notificaciones según tus permisos de ofertas.
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Chip
            value={`NO LEÍDAS: ${canBoth ? countNoLeidas : visibleNoLeidasCount}`}
            className={
              (canBoth ? countNoLeidas : visibleNoLeidasCount) > 0
                ? "bg-[#2B338C] text-white"
                : "bg-blue-gray-100 text-blue-gray-800"
            }
          />
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-3 overflow-visible relative z-[200]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            crossOrigin=""
            label="Buscar (mensaje)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className={CONT_CLS}>
            <Select
              label="Lectura"
              value={soloNoLeidas ? "NoLeidas" : "Todas"}
              onChange={(v) => setSoloNoLeidas(v === "NoLeidas")}
              containerProps={{ className: CONT_CLS }}
              menuProps={{ className: MENU_CLS }}
            >
              <Option value="Todas">Todas</Option>
              <Option value="NoLeidas">Solo no leídas</Option>
            </Select>
          </div>

          <div className={CONT_CLS}>
            <Select
              label="Page size"
              value={String(pageSize)}
              onChange={(v) => setPageSize(Number(v))}
              containerProps={{ className: CONT_CLS }}
              menuProps={{ className: MENU_CLS }}
            >
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
            </Select>
          </div>

          <div className="flex gap-2">
            <Tooltip content="Refrescar">
              <Button
                variant="outlined"
                className="border-[#2B338C] text-[#2B338C] w-full flex items-center justify-center gap-2"
                onClick={() => {
                  loadNotis();
                  loadCountNoLeidas();
                }}
                disabled={showLoading || busyId === "ALL"}
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refrescar
              </Button>
            </Tooltip>

            <Button
              variant="outlined"
              className="border-[#2B338C] text-[#2B338C] w-full"
              onClick={clearFilters}
              disabled={showLoading}
            >
              Limpiar
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <Typography className="text-sm text-blue-gray-600">
            Mostrando <b>{fromIdx}</b>–<b>{toIdx}</b> de <b>{total}</b>
          </Typography>

          <div className="flex items-center gap-2">
            <Button
              className="bg-[#FFDA00] text-[#2B338C]"
              onClick={marcarTodasComoLeidas}
              disabled={
                busyId === "ALL" ||
                showLoading ||
                (canBoth ? total === 0 : visibleNotis.length === 0)
              }
            >
              {busyId === "ALL" ? "Procesando..." : "Marcar todas como leídas"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista */}
      <div className="space-y-3">
        {showLoading ? (
          <Card className="p-6">
            <Typography>Cargando...</Typography>
          </Card>
        ) : loadingTipos && showOnlyByPerms ? (
          <Card className="p-6">
            <Typography className="text-blue-gray-600">
              Cargando tipo de oferta para filtrar notificaciones...
            </Typography>
          </Card>
        ) : visibleNotis.length === 0 ? (
          <Card className="p-6">
            <Typography className="text-blue-gray-600">
              No hay notificaciones que coincidan con el filtro (o no tienes permisos para verlas).
            </Typography>
          </Card>
        ) : (
          visibleNotis.map((n) => (
            <NotiItem
              key={n.notificacionId}
              item={n}
              busy={busyId === n.notificacionId}
              tipoLoading={
                loadingTipos && n.ofertaId && ofertaModalidadMap[n.ofertaId] == null
              }
              disabled={!canActOnNoti(n)}
              onAbrirOferta={(it) => handleOpenFicha(it.ofertaId)}
              onMarcarLeida={marcarComoLeida}
            />
          ))
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <Card className="p-3 flex items-center justify-between">
            <Button
              variant="outlined"
              className="border-[#2B338C] text-[#2B338C]"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={showLoading || page <= 1}
            >
              Anterior
            </Button>

            <Typography className="text-sm text-blue-gray-700">
              Página <b>{page}</b> de <b>{totalPages}</b>
            </Typography>

            <Button
              variant="outlined"
              className="border-[#2B338C] text-[#2B338C]"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={showLoading || page >= totalPages}
            >
              Siguiente
            </Button>
          </Card>
        )}
      </div>

      {/* Modal Ficha Oferta */}
      <FichaOfertaModal
        open={openFicha}
        onClose={handleCloseFicha}
        modo={modo}
        isNuevo={isNuevo}
        editMode={editMode}
        OfertaCancelada={OfertaCancelada}
        fichaLoading={fichaLoading}
        fichaError={fichaError}
        fichaData={fichaData}
        fichaForm={fichaForm}
        cursos={cursos}
        sedes={sedes}
        horarios={horarios}
        periodos={periodos}
        coordinadores={coordinadores}
        estados={estados}
        personas={personas}
        modalidades={modalidades}
        setFichaForm={setFichaForm}
        onGuardar={() => {}}
        onRegistrar={() => {}}
        accionChips={accionChips}
        estadoChips={estadoChips}
      />
    </div>
  );
}
