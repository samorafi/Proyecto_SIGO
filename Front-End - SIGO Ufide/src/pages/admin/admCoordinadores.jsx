// src/pages/admin/admCoordinadores.jsx
import { useEffect, useMemo, useState } from "react";
import PageTitle from "@/components/ui/Title/PageTitle";
import { useCatalogos } from "@/hooks/useCatalogos";
import { usePeriodos } from "@/hooks/usePeriodos";

import {
    Card,
    Button,
    Input,
    Select,
    Option,
    Typography,
    Tooltip,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Checkbox,
    Switch,
} from "@material-tailwind/react";

import {
    MagnifyingGlassIcon,
    EyeIcon,
    PencilSquareIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

/* ===================== UI helpers ===================== */
const Pill = ({ children, className = "" }) => (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${className}`}>
        {children}
    </span>
);

const BoolEstadoChip = ({ value }) => (
    <Pill className={value ? "bg-green-600" : "bg-red-600"}>{value ? "ACTIVO" : "INACTIVO"}</Pill>
);

const MENU_CLS =
    "z-[2147483647] bg-white/100 border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto";
const CONT_CLS = "relative z-0";

const Field = ({ children }) => (
    <div className="relative z-0 focus-within:z-[500] overflow-visible">
        {children}
    </div>
);

/* ===================== Utils ===================== */
const asArray = (json) => {
    if (Array.isArray(json)) return json;
    const arr = json?.data ?? json?.items ?? json?.result ?? json?.results ?? [];
    return Array.isArray(arr) ? arr : [];
};

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

const fullName = (p) => {
    if (!p) return "—";
    const n = p.nombre ?? p.Name ?? p.Nombres ?? "";
    const a1 = p.primerApellido ?? p.Apellido1 ?? p.apellido1 ?? "";
    const a2 = p.segundoApellido ?? p.Apellido2 ?? p.apellido2 ?? "";
    const s = [n, a1, a2].filter(Boolean).join(" ").trim();
    return s || "—";
};

const periodoLabel = (p) => {
    if (!p) return "—";
    const numero = p.numero ?? p.Numero ?? p.num ?? p.Num;
    const tipo = p.tipo ?? p.Tipo ?? "";
    const anio = p.anio ?? p.Anio ?? p.anioAcademico ?? p.year;
    const numTipo = [numero, tipo].filter(Boolean).join("");
    if (numTipo && anio) return `${numTipo}, ${anio}`;
    if (anio) return String(anio);
    if (numTipo) return numTipo;
    return p.rango ?? p.label ?? "—";
};

const cursoLabel = (c) => {
    if (!c) return "—";
    const codigo = c.codigo ?? c.Codigo ?? "";
    const nombre = c.nombre ?? c.Nombre ?? c.descripcion ?? "";
    const both = [codigo, nombre].filter(Boolean).join(" - ").trim();
    return both || nombre || codigo || "—";
};

const carreraLabel = (c) => {
    if (!c) return "—";
    return c.nombre ?? c.Nombre ?? c.descripcion ?? c.descripcionCarrera ?? "—";
};

// intenta sacar carreraId desde el objeto curso (según tu modelo real)
const getCursoCarreraId = (c) =>
    Number(
        c?.carreraId ??
        c?.CarreraId ??
        c?.carrera?.carreraId ??
        c?.carrera?.id ??
        c?.Carrera?.CarreraId ??
        c?.Carrera?.Id ??
        0
    ) || null;

const normalizePeriodos = (periodos = []) =>
    periodos.map((p) => ({
        ...p,
        tipo: p.tipo ?? p.Tipo,
        anio: p.anio ?? p.Anio,
        numero: p.numero ?? p.Numero,
        periodoId: p.periodoId ?? p.id ?? p.PeriodoId ?? p.Id,
    }));

/* ===================== Dialog: Ficha ===================== */
function FichaCoordinacion({ open, onClose, id, maps }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!open || !id) return;
        let alive = true;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const r = await fetch(`/api/coordinaciones/${id}`);
                if (!r.ok) throw new Error(await buildApiError(r));
                const j = await r.json();
                if (!alive) return;
                setData(j);
            } catch (e) {
                if (!alive) return;
                setErr(String(e?.message ?? e));
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [open, id]);

    const persona = maps.personaById[String(data?.personaId)];
    const per = maps.periodoById[String(data?.periodoId)];
    const car = maps.carreraById[String(data?.carreraId)];
    const cursos = (data?.cursoIds ?? [])
        .map((cid) => maps.cursoById[String(cid)])
        .filter(Boolean);

    return (
        <Dialog open={open} handler={onClose} size="md" className="rounded-xl bg-white overflow-visible">
            <DialogHeader className="flex items-center justify-between bg-[#2B338C] text-white rounded-t-xl">
                <div className="flex flex-col">
                    <Typography variant="h6" color="white">Ficha de Coordinación</Typography>
                    <Typography variant="small" color="white" className="opacity-90">Detalle de la coordinación</Typography>
                </div>
                <Button variant="text" color="white" onClick={onClose} className="p-2">
                    <XMarkIcon className="h-5 w-5" />
                </Button>
            </DialogHeader>

            <DialogBody className="space-y-4 overflow-visible">
                {loading && <Typography>Cargando...</Typography>}
                {!loading && err && <Typography className="text-red-600 text-sm">{err}</Typography>}
                {!loading && !err && data && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Typography variant="small" className="text-blue-gray-500">Persona</Typography>
                                <Typography className="font-semibold">{fullName(persona)}</Typography>
                            </div>
                            <div>
                                <Typography variant="small" className="text-blue-gray-500">Periodo de Nombramiento</Typography>
                                <Typography className="font-semibold">{periodoLabel(per)}</Typography>
                            </div>

                            <div>
                                <Typography variant="small" className="text-blue-gray-500">Carrera</Typography>
                                <Typography className="font-semibold">{carreraLabel(car)}</Typography>
                            </div>

                            <div>
                                <Typography variant="small" className="text-blue-gray-500">Estado</Typography>
                                <div className="mt-1"><BoolEstadoChip value={Boolean(data.estado)} /></div>
                            </div>
                        </div>

                        <div>
                            <Typography variant="small" className="text-blue-gray-500">Cursos</Typography>
                            {cursos.length === 0 ? (
                                <Typography className="font-semibold">—</Typography>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {cursos.map((c, idx) => (
                                        <Pill key={`${c.cursoId ?? c.id ?? idx}`} className="bg-blue-gray-700">
                                            {cursoLabel(c)}
                                        </Pill>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <Typography variant="small" className="text-blue-gray-500">Comentarios</Typography>
                            <Typography className="font-semibold whitespace-pre-wrap">{data.comentarios || "—"}</Typography>
                        </div>
                    </div>
                )}
            </DialogBody>

            <DialogFooter className="gap-2">
                <Button variant="outlined" className="border-[#2B338C] text-[#2B338C]" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

/* ===================== Dialog: Form ===================== */
function CoordinacionForm({
    title,
    subtitle,
    open,
    onClose,
    initial,
    onSubmit,
    catalogs,
}) {
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    const [personaId, setPersonaId] = useState("");
    const [periodoId, setPeriodoId] = useState("");
    const [carreraId, setCarreraId] = useState("");
    const [estado, setEstado] = useState(true);
    const [comentarios, setComentarios] = useState("");
    const [cursoIds, setCursoIds] = useState([]);

    const [personaSearch, setPersonaSearch] = useState("");
    const [cursoSearch, setCursoSearch] = useState("");

    useEffect(() => {
        if (!open) return;
        setErr("");
        setPersonaId(String(initial?.personaId ?? ""));
        setPeriodoId(String(initial?.periodoId ?? ""));
        setCarreraId(String(initial?.carreraId ?? ""));
        setEstado(Boolean(initial?.estado ?? true));
        setComentarios(initial?.comentarios ?? "");
        setCursoIds(Array.isArray(initial?.cursoIds) ? initial.cursoIds.map(Number) : []);
        setPersonaSearch("");
        setCursoSearch("");
    }, [open, initial]);

    const personas = catalogs.personas ?? [];
    const periodosNormalized = useMemo(
        () => normalizePeriodos(catalogs.periodos ?? []),
        [catalogs.periodos]
    );

    const { periodosOrdenados: periodosOrdenadosC } = usePeriodos(periodosNormalized, "C");
    const carreras = catalogs.carreras ?? [];
    const cursos = catalogs.cursos ?? [];

    const carreraIdNum = carreraId ? Number(carreraId) : null;


    const personasFiltradas = useMemo(() => {
        const q = personaSearch.trim().toLowerCase();
        if (!q) return personas;
        return personas.filter((p) =>
            fullName(p).toLowerCase().includes(q) ||
            String(p.identificacion ?? "").toLowerCase().includes(q)
        );
    }, [personas, personaSearch]);


    const cursosBase = useMemo(() => {
        if (!carreraIdNum) return cursos;
        return cursos.filter((c) => getCursoCarreraId(c) === carreraIdNum);
    }, [cursos, carreraIdNum]);



    const cursosFiltrados = useMemo(() => {
        const q = cursoSearch.trim().toLowerCase();
        if (!q) return cursosBase;
        return cursosBase.filter((c) => cursoLabel(c).toLowerCase().includes(q));
    }, [cursosBase, cursoSearch]);


    useEffect(() => {
        if (!carreraIdNum) return;

        setCursoIds((prev) => {
            const allowed = new Set(cursosBase.map((c) => Number(c.cursoId ?? c.id)));
            return prev.filter((id) => allowed.has(Number(id)));
        });
    }, [carreraIdNum, cursosBase]);

    const toggleCurso = (id) => {
        const cid = Number(id);
        setCursoIds((prev) => (prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]));
    };

    const submit = async () => {
        setSaving(true);
        setErr("");

        if (!personaId) {
            setSaving(false);
            setErr("Debes seleccionar una persona.");
            return;
        }
        if (!periodoId) {
            setSaving(false);
            setErr("Debes seleccionar un periodo.");
            return;
        }

        const payload = {
            personaId: Number(personaId),
            periodoId: Number(periodoId),
            carreraId: carreraId ? Number(carreraId) : null, // ✅ ahora puede ser null
            estado: Boolean(estado),
            comentarios: (comentarios ?? "").trim() || null,
            cursoIds: cursoIds.length ? cursoIds : [],
        };

        try {
            await onSubmit(payload);
            onClose();
        } catch (e) {
            setErr(String(e?.message ?? e));
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
            <DialogHeader className="bg-[#2B338C] text-white rounded-t-xl">
                <div className="flex flex-col">
                    <Typography variant="h6" color="white">{title}</Typography>
                    <Typography variant="small" color="white" className="opacity-90">{subtitle}</Typography>
                </div>
            </DialogHeader>

            <DialogBody className="space-y-5 overflow-visible relative isolate z-0">
                {err && <Typography className="text-red-600 text-sm">{err}</Typography>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Persona */}
                    <div className="relative z-0 focus-within:z-[500] overflow-visible">
                        <Typography variant="small" className="text-blue-gray-500 mb-1">Persona</Typography>
                        <Input
                            label="Buscar por nombre o identificación"
                            value={personaSearch}
                            onChange={(e) => setPersonaSearch(e.target.value)}
                            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                        />
                        <div className="mt-2">
                            <Select
                                label="Selecciona persona"
                                value={personaId}
                                onChange={(v) => setPersonaId(v)}
                                containerProps={{ className: CONT_CLS }}
                                menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                            >
                                {personasFiltradas.map((p) => {
                                    const id = String(p.personaId ?? p.id);
                                    const ident = p.identificacion ? ` (${p.identificacion})` : "";
                                    return (
                                        <Option key={id} value={id}>
                                            {fullName(p)}{ident}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </div>
                    </div>

                    {/* Periodo */}
                    <div className="relative z-0 focus-within:z-[500] overflow-visible">
                        <Typography variant="small" className="text-blue-gray-500 mb-1">Periodo de Nombramiento</Typography>
                        <Select
                            label="Selecciona periodo"
                            value={periodoId}
                            onChange={(v) => setPeriodoId(v)}
                            containerProps={{ className: CONT_CLS }}
                            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                        >
                            {periodosOrdenadosC.map((p) => (
                                <Option key={String(p.periodoId)} value={String(p.periodoId)}>
                                    {periodoLabel(p)}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Carrera */}
                    <div className="relative z-0 focus-within:z-[500] overflow-visible">
                        <Typography variant="small" className="text-blue-gray-500 mb-1">Carrera</Typography>
                        <Select
                            label="Selecciona carrera (opcional)"
                            value={carreraId}
                            onChange={(v) => setCarreraId(v)}
                            containerProps={{ className: CONT_CLS }}
                            menuProps={{ className: MENU_CLS, keepMounted: true, placement: "bottom-start" }}
                        >
                            <Option value="">Todas</Option>
                            {carreras.map((c) => (
                                <Option key={String(c.carreraId ?? c.id)} value={String(c.carreraId ?? c.id)}>
                                    {carreraLabel(c)}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-4 mt-2">
                        <div>
                            <Typography variant="small" className="text-blue-gray-500 mb-1">Estado</Typography>
                            <div className="flex items-center gap-3">
                                <Switch checked={estado} onChange={(e) => setEstado(e.target.checked)} color="green" />
                                <BoolEstadoChip value={estado} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cursos (todas las carreras si no selecciona carrera) */}
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <Typography variant="small" className="text-blue-gray-500">Cursos</Typography>
                        <Typography variant="small" className="text-blue-gray-700 font-semibold">
                            Seleccionados: {cursoIds.length}
                        </Typography>
                    </div>

                    <Card className="mt-3 p-3 border border-blue-gray-100 shadow-sm bg-blue-gray-50 overflow-visible">
                        <Typography className="text-blue-gray-600 text-sm">
                            {carreraId
                                ? "Mostrando cursos de la carrera seleccionada."
                                : "Mostrando cursos de todas las carreras (opcional: selecciona carrera para filtrar)."}
                        </Typography>
                    </Card>

                    <div className="mt-2">
                        <Input
                            label="Buscar curso (código o nombre)"
                            value={cursoSearch}
                            onChange={(e) => setCursoSearch(e.target.value)}
                            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                        />
                    </div>

                    <Card className="mt-3 p-3 border border-blue-gray-100 shadow-sm overflow-visible">
                        <div className="max-h-56 overflow-auto pr-2 space-y-2">
                            {cursosFiltrados.map((c) => {
                                const cid = Number(c.cursoId ?? c.id);
                                const checked = cursoIds.includes(cid);
                                return (
                                    <div
                                        key={String(cid)}
                                        className="flex items-center justify-between gap-3 hover:bg-blue-gray-50 rounded-lg px-2 py-1"
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onChange={() => toggleCurso(cid)}
                                            label={<span className="text-sm">{cursoLabel(c)}</span>}
                                            crossOrigin={undefined}
                                        />
                                    </div>
                                );
                            })}

                            {cursosFiltrados.length === 0 && (
                                <Typography variant="small" className="text-blue-gray-500">
                                    No hay cursos (o no coinciden con el filtro).
                                </Typography>
                            )}
                        </div>
                    </Card>

                    {cursoIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {cursoIds
                                .map((id) => cursosBase.find((c) => Number(c.cursoId ?? c.id) === Number(id)))
                                .filter(Boolean)
                                .slice(0, 12)
                                .map((c, idx) => (
                                    <Pill key={`${c.cursoId ?? c.id ?? idx}`} className="bg-blue-gray-700">
                                        {cursoLabel(c)}
                                    </Pill>
                                ))}
                            {cursoIds.length > 12 && (
                                <Pill className="bg-blue-gray-500">+{cursoIds.length - 12} más</Pill>
                            )}
                        </div>
                    )}
                </div>

                {/* Comentarios */}
                <div>
                    <Typography variant="small" className="text-blue-gray-500 mb-1">Comentarios</Typography>
                    <Input label="Comentarios" value={comentarios} onChange={(e) => setComentarios(e.target.value)} />
                </div>
            </DialogBody>

            <DialogFooter className="gap-2">
                <Button
                    variant="outlined"
                    className="border-[#2B338C] text-[#2B338C]"
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancelar
                </Button>
                <Button className="bg-[#2B338C]" onClick={submit} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

/* ===================== Modales Create/Edit ===================== */
function AgregarCoordinacion({ open, onClose, catalogs, onSaved }) {
    const onSubmit = async (payload) => {
        const r = await fetch("/api/coordinaciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error(await buildApiError(r));
        await r.json();
        onSaved?.();
    };

    return (
        <CoordinacionForm
            title="Nueva Coordinación"
            subtitle="Crea una coordinación"
            open={open}
            onClose={onClose}
            initial={{ estado: true, cursoIds: [] }}
            onSubmit={onSubmit}
            catalogs={catalogs}
        />
    );
}

function EditarCoordinacionModal({ open, onClose, id, catalogs, onSaved }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [initial, setInitial] = useState(null);

    useEffect(() => {
        if (!open || !id) return;
        let alive = true;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const r = await fetch(`/api/coordinaciones/${id}`);
                if (!r.ok) throw new Error(await buildApiError(r));
                const j = await r.json();
                if (!alive) return;
                setInitial(j);
            } catch (e) {
                if (!alive) return;
                setErr(String(e?.message ?? e));
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [open, id]);

    const onSubmit = async (payload) => {
        const r = await fetch(`/api/coordinaciones/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error(await buildApiError(r));
        onSaved?.();
    };

    return (
        <Dialog open={open} handler={onClose} size="lg" className="rounded-xl bg-white overflow-visible">
            <DialogHeader className="flex items-center justify-between bg-[#2B338C] text-white rounded-t-xl">
                <div className="flex flex-col">
                    <Typography variant="h6" color="white">Editar Coordinación</Typography>
                    <Typography variant="small" color="white" className="opacity-90">Modifica y guarda cambios</Typography>
                </div>
                <Button variant="text" color="white" onClick={onClose} className="p-2">
                    <XMarkIcon className="h-5 w-5" />
                </Button>
            </DialogHeader>

            <DialogBody className="space-y-3 overflow-visible">
                {loading && <Typography>Cargando...</Typography>}
                {!loading && err && <Typography className="text-red-600 text-sm">{err}</Typography>}
                {!loading && !err && initial && (
                    <CoordinacionForm
                        title="Editar Coordinación"
                        subtitle="Actualiza los datos"
                        open={true}
                        onClose={onClose}
                        initial={initial}
                        onSubmit={onSubmit}
                        catalogs={catalogs}
                    />
                )}
            </DialogBody>
        </Dialog>
    );
}

/* ===================== Página principal ===================== */
export default function Coordinadores() {
    const catalogs = useCatalogos();

    const periodosNormalized = useMemo(
        () => normalizePeriodos(catalogs.periodos ?? []),
        [catalogs.periodos]
    );

    const { periodosOrdenados: periodosOrdenadosC } = usePeriodos(periodosNormalized, "C");

    const { loading: catLoading, error: catError } = catalogs;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rows, setRows] = useState([]);

    const [q, setQ] = useState("");
    const [fPeriodo, setFPeriodo] = useState("Todos");
    const [fEstado, setFEstado] = useState("Todos");

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openFicha, setOpenFicha] = useState(false);
    const [editId, setEditId] = useState(null);
    const [fichaId, setFichaId] = useState(null);

    const maps = useMemo(() => {
        const personaById = Object.fromEntries((catalogs.personas ?? []).map((p) => [String(p.personaId ?? p.id), p]));
        const periodoById = Object.fromEntries((catalogs.periodos ?? []).map((p) => [String(p.periodoId ?? p.id), p]));
        const cursoById = Object.fromEntries((catalogs.cursos ?? []).map((c) => [String(c.cursoId ?? c.id), c]));
        const carreraById = Object.fromEntries((catalogs.carreras ?? []).map((c) => [String(c.carreraId ?? c.id), c]));
        return { personaById, periodoById, cursoById, carreraById };
    }, [catalogs.personas, catalogs.periodos, catalogs.cursos, catalogs.carreras]);

    const loadRows = async () => {
        setLoading(true);
        setError("");
        try {
            const r = await fetch("/api/coordinaciones");
            if (!r.ok) throw new Error(await buildApiError(r));
            const j = await r.json();
            setRows(asArray(j));
            setPage(1);
        } catch (e) {
            setError(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadRows(); }, []);

    const enriched = useMemo(() => {
        return (rows ?? []).map((x) => {
            const persona = maps.personaById[String(x.personaId)];
            const per = maps.periodoById[String(x.periodoId)];
            const car = maps.carreraById[String(x.carreraId)];
            const cursos = (x.cursoIds ?? []).map((cid) => maps.cursoById[String(cid)]).filter(Boolean);

            return {
                ...x,
                _personaName: fullName(persona),
                _periodoLabel: periodoLabel(per),
                _carreraLabel: carreraLabel(car),
                _cursosLabel: cursos.map(cursoLabel).join(", "),
            };
        });
    }, [rows, maps]);

    const filtered = useMemo(() => {
        let arr = [...enriched];

        const qq = q.trim().toLowerCase();
        if (qq) {
            arr = arr.filter((x) => {
                const hay = [
                    x._personaName,
                    x._periodoLabel,
                    x._carreraLabel,
                    x._cursosLabel,
                    x.comentarios ?? "",
                    String(x.coordinacionId ?? ""),
                ].join(" | ").toLowerCase();
                return hay.includes(qq);
            });
        }

        if (fPeriodo !== "Todos") arr = arr.filter((x) => String(x.periodoId) === String(fPeriodo));
        if (fEstado !== "Todos") {
            const want = fEstado === "Activo";
            arr = arr.filter((x) => Boolean(x.estado) === want);
        }

        arr.sort((a, b) => Number(b.coordinacionId ?? 0) - Number(a.coordinacionId ?? 0));
        return arr;
    }, [enriched, q, fPeriodo, fEstado]);

    const counts = useMemo(() => {
        const total = filtered.length;
        const activos = filtered.filter((x) => Boolean(x.estado)).length;
        return { total, activos, inactivos: total - activos };
    }, [filtered]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / rowsPerPage)), [filtered.length, rowsPerPage]);

    useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

    const pageData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    const clearFilters = () => {
        setQ("");
        setFPeriodo("Todos");
        setFEstado("Todos");
        setPage(1);
    };

    const showLoading = loading || catLoading;

    return (
        <div className="space-y-5">
            <PageTitle>Gestión de Coordinaciones</PageTitle>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <Typography variant="h6" className="text-[#2B338C]">Coordinaciones</Typography>
                    <Typography variant="small" className="text-blue-gray-500">
                        Administra coordinaciones por persona, carrera, periodo y cursos
                    </Typography>
                </div>

                <Button className="bg-[#2B338C] flex items-center gap-2" onClick={() => setOpenAdd(true)}>
                    <PlusIcon className="h-4 w-4" />
                    Nueva coordinación
                </Button>
            </div>

            {catError && (
                <Card className="p-4 border border-red-200 bg-red-50 overflow-visible">
                    <Typography className="text-red-700 text-sm">{String(catError)}</Typography>
                </Card>
            )}

            {/* ✅ overflow-visible para que dropdown no quede “atrás” */}
            <Card className="p-4 shadow-sm border border-blue-gray-100 overflow-visible relative z-[200]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                        label="Buscar (persona, carrera, periodo, curso, comentario)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                    />

                    <div className={CONT_CLS}>
                        <Select
                            label="Periodo"
                            value={fPeriodo}
                            onChange={(v) => setFPeriodo(v)}
                            containerProps={{ className: CONT_CLS }}
                            menuProps={{ className: MENU_CLS }}
                        >
                            <Option value="Todos">Todos</Option>
                            {periodosOrdenadosC.map((p) => (
                                <Option key={String(p.periodoId)} value={String(p.periodoId)}>
                                    {periodoLabel(p)}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className={CONT_CLS}>
                        <Select
                            label="Estado"
                            value={fEstado}
                            onChange={(v) => setFEstado(v)}
                            containerProps={{ className: CONT_CLS }}
                            menuProps={{ className: MENU_CLS }}
                        >
                            <Option value="Todos">Todos</Option>
                            <Option value="Activo">Activo</Option>
                            <Option value="Inactivo">Inactivo</Option>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outlined" className="border-[#2B338C] text-[#2B338C] w-full" onClick={clearFilters}>
                            Limpiar
                        </Button>
                        <Button variant="outlined" className="border-[#2B338C] text-[#2B338C] w-full" onClick={loadRows}>
                            Refrescar
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <Pill className="bg-[#2B338C]">TOTAL: {counts.total}</Pill>
                    <Pill className="bg-green-600">ACTIVAS: {counts.activos}</Pill>
                    <Pill className="bg-red-600">INACTIVAS: {counts.inactivos}</Pill>
                </div>
            </Card>

            <Card className="shadow-sm border border-blue-gray-100 overflow-visible relative z-0 isolate">
                <div className="p-4 flex items-center justify-between gap-3">
                    <Typography variant="h6" className="text-[#2B338C]">Resultados</Typography>

                    <div className={CONT_CLS}>
                        <Select
                            label="Filas"
                            value={String(rowsPerPage)}
                            onChange={(v) => setRowsPerPage(Number(v))}
                            containerProps={{ className: CONT_CLS }}
                            menuProps={{ className: MENU_CLS }}
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <Option key={n} value={String(n)}>{n}</Option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="overflow-auto">
                    <table className="w-full min-w-[1100px]">
                        <thead>
                            <tr className="bg-blue-gray-50/80">
                                <th className="p-3 text-left"><Typography variant="small" className="font-bold text-blue-gray-700">Persona</Typography></th>
                                <th className="p-3 text-left"><Typography variant="small" className="font-bold text-blue-gray-700">Carrera</Typography></th>
                                <th className="p-3 text-left"><Typography variant="small" className="font-bold text-blue-gray-700">Periodo de Nombramiento</Typography></th>
                                <th className="p-3 text-left"><Typography variant="small" className="font-bold text-blue-gray-700">Cursos</Typography></th>
                                <th className="p-3 text-left"><Typography variant="small" className="font-bold text-blue-gray-700">Estado</Typography></th>
                                <th className="p-3 text-left"><Typography variant="small" className="font-bold text-blue-gray-700">Comentarios</Typography></th>
                                <th className="p-3 text-right"><Typography variant="small" className="font-bold text-blue-gray-700">Acciones</Typography></th>
                            </tr>
                        </thead>

                        <tbody>
                            {showLoading && (
                                <tr><td colSpan={7} className="p-6"><Typography>Cargando...</Typography></td></tr>
                            )}

                            {!showLoading && error && (
                                <tr><td colSpan={7} className="p-6"><Typography className="text-red-600 text-sm">{error}</Typography></td></tr>
                            )}

                            {!showLoading && !error && pageData.length === 0 && (
                                <tr><td colSpan={7} className="p-6"><Typography className="text-blue-gray-500">Sin resultados.</Typography></td></tr>
                            )}

                            {!showLoading && !error && pageData.map((x) => (
                                <tr key={x.coordinacionId} className="border-t border-blue-gray-100 hover:bg-blue-gray-50/60">
                                    <td className="p-3">
                                        <Typography className="font-semibold">{x._personaName}</Typography>
                                    </td>
                                    <td className="p-3"><Typography className="font-semibold">{x._carreraLabel}</Typography></td>
                                    <td className="p-3"><Typography className="font-semibold">{x._periodoLabel}</Typography></td>
                                    <td className="p-3"><Typography className="text-sm">{x._cursosLabel || "—"}</Typography></td>
                                    <td className="p-3"><BoolEstadoChip value={Boolean(x.estado)} /></td>
                                    <td className="p-3"><Typography className="text-sm">{x.comentarios || "—"}</Typography></td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            <Tooltip content="Ver ficha">
                                                <Button variant="text" className="p-2" onClick={() => { setFichaId(x.coordinacionId); setOpenFicha(true); }}>
                                                    <EyeIcon className="h-5 w-5 text-[#2B338C]" />
                                                </Button>
                                            </Tooltip>

                                            <Tooltip content="Editar">
                                                <Button variant="text" className="p-2" onClick={() => { setEditId(x.coordinacionId); setOpenEdit(true); }}>
                                                    <PencilSquareIcon className="h-5 w-5 text-[#2B338C]" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <Typography variant="small" className="text-blue-gray-500">
                        Mostrando <span className="font-semibold">{filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}</span>
                        {" "} - <span className="font-semibold">{Math.min(page * rowsPerPage, filtered.length)}</span>
                        {" "} de <span className="font-semibold">{filtered.length}</span>
                    </Typography>

                    <div className="flex items-center gap-2">
                        <Button variant="outlined" size="sm" className="border-[#2B338C] text-[#2B338C] px-3" disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            <ChevronLeftIcon className="h-4 w-4" />
                        </Button>

                        <Typography variant="small" className="text-blue-gray-700">
                            Página <span className="font-bold">{page}</span> / <span className="font-bold">{totalPages}</span>
                        </Typography>

                        <Button variant="outlined" size="sm" className="border-[#2B338C] text-[#2B338C] px-3" disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Modales */}
            <AgregarCoordinacion open={openAdd} onClose={() => setOpenAdd(false)} catalogs={catalogs} onSaved={loadRows} />

            <FichaCoordinacion open={openFicha} onClose={() => setOpenFicha(false)} id={fichaId} maps={maps} />

            <EditarCoordinacionModal open={openEdit} onClose={() => setOpenEdit(false)} id={editId} catalogs={catalogs} onSaved={loadRows} />
        </div>
    );
}
