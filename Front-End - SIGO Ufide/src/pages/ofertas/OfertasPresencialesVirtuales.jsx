import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Card, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip, Input, Select, Option, Chip } from "@material-tailwind/react";
import { EyeIcon, PencilSquareIcon, PaperAirplaneIcon, XCircleIcon, ArrowUpTrayIcon, PlusIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useCatalogosOfertas } from "@/hooks/useCatalogosOfertas";

export default function OfertasPresencialesVirtuales() {

    // Estados de datos de ofertas
    const [ofertas, setOfertas] = useState([]);
    const {
        cursos,
        sedes,
        modalidades,
        horarios: horario,
        periodos,
        coordinadores,
        estados,
        loading: loadingCatalogos,
        error: errorCatalogos,
    } = useCatalogosOfertas();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados del modal
    const [openFicha, setOpenFicha] = useState(false);
    const [openNueva, setOpenNueva] = useState(false);

    // Estados de formulario ---
    const [fichaId, setFichaId] = useState(null);
    const [fichaData, setFichaData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [fichaLoading, setFichaLoading] = useState(false);
    const [fichaError, setFichaError] = useState("");
    const [nuevaOferta, setNuevaOferta] = useState({
        cursoId: "",
        sedeId: "",
        modalidadId: "",
        horarioId: "",
        periodoId: "",
        coordinadorId: "",
        comentarios: "",
        accionId: 2 // El estado se coloca Pendiente por defecto
    });

    // Paginación y filtros
    const [term, setTerm] = useState("");
    const [filterCurso, setFilterCurso] = useState("");
    const [filterSede, setFilterSede] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [filterCoordinador, setFilterCoordinador] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Funcion futura de importación
    const [importName, setImportName] = useState("");

    // Obtener datos de ofertas
    useEffect(() => {
        const fetchOfertas = async () => {
            try {
                const res = await fetch("/api/ofertas");
                const data = await res.json();

                // Filtro para modalidades Presencial (1) y Virtual (2)
                const modalidadesFiltrar = [1, 2];
                const ofertasFiltradas = (data || []).filter((o) =>
                    modalidadesFiltrar.includes(o.modalidadId)
                );

                setOfertas(ofertasFiltradas);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar las ofertas.");
            } finally {
                setLoading(false);
            }
        };
        fetchOfertas();
    }, []);

    // Funciones auxiliares para obtener nombres relacionados
    const getCursoNombre = useCallback(
        (id) => cursos.find((c) => c.cursoId === id)?.nombre ?? id,
        [cursos]
    );

    const getCursoId = useCallback(
        (id) => cursos.find((c) => c.cursoId === id)?.codigo ?? id,
        [cursos]
    );

    const getSedeNombre = useCallback(
        (id) => sedes.find((s) => s.sedeId === id)?.nombre ?? id,
        [sedes]
    );

    const getModalidadNombre = useCallback(
        (id) => modalidades.find((m) => m.modalidadId === id)?.nombre ?? id,
        [modalidades]
    );

    const getHorarioNombre = useCallback(
        (id) => {
            const hora = horario.find((h) => h.horarioId === id);
            return hora ? `${hora.dia} - ${hora.rango}` : id;
        },
        [horario]
    );

    const getPeriodoNombre = useCallback(
        (id) => {
            const per = periodos.find((p) => p.periodoId === id);
            return per ? `${per.numero}Q - ${per.anio}` : id;
        },
        [periodos]
    );

    const getCoordinadorNombre = useCallback(
        (id) => coordinadores.find((c) => c.id === id)?.nombre ?? id,
        [coordinadores]
    );

    // Colores para estados
    const colorMap = useMemo(
        () => ({
            Pendiente: { label: "PENDIENTE", color: "amber" },
            Enviada: { label: "ENVIADA", color: "blue" },
            Aceptada: { label: "ACEPTADA", color: "green" },
            Rechazada: { label: "RECHAZADA", color: "red" },
            Cancelada: { label: "CANCELADA", color: "gray" },
        }),
        []
    );

    const getEstadoNombre = useCallback(
        (id) => {
            const estado = estados.find((e) => e.accionId === id)?.nombre ?? "Desconocido";
            const { label, color } = colorMap[estado] || {
                label: estado.toUpperCase(),
                color: "blue-gray",
            };
            return (
                <Chip
                    value={label}
                    color={color}
                    className="font-bold text-white rounded-full px-4 py-1 w-fit min-w-[90px] text-center"
                />
            );
        },
        [estados, colorMap]
    );



    // Ordenar, filtrar y paginar
    const filtered = useMemo(() => {
        try {
            return [...ofertas]
                .sort((a, b) => b.ofertaId - a.ofertaId)
                .filter((o) => {
                    const matchCurso = filterCurso ? o.cursoId === Number(filterCurso) : true;
                    const matchSede = filterSede ? o.sedeId === Number(filterSede) : true;
                    const matchEstado = filterEstado ? o.accionId === Number(filterEstado) : true;
                    const matchCoordinador = filterCoordinador ? o.coordinadorId === Number(filterCoordinador) : true;

                    const texto = `${getCursoNombre(o.cursoId)} ${getSedeNombre(o.sedeId)} ${getModalidadNombre(o.modalidadId)} ${getHorarioNombre(o.horarioId)} ${getPeriodoNombre(o.periodoId)} ${getCoordinadorNombre(o.coordinadorId)} ${estados.find(e => e.accionId === o.accionId)?.nombre ?? ""}`.toLowerCase();
                    const termMatch = term ? texto.includes(term.toLowerCase()) : true;

                    return matchCurso && matchSede && matchEstado && matchCoordinador && termMatch;
                });
        } catch {
            return ofertas;
        }
    }, [
        ofertas,
        filterCurso,
        filterSede,
        filterEstado,
        filterCoordinador,
        term,
        estados,
        getCursoNombre,
        getSedeNombre,
        getModalidadNombre,
        getHorarioNombre,
        getPeriodoNombre,
        getCoordinadorNombre,
    ]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    const currentData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    // Limpieza de filtros
    const limpiarFiltros = () => {
        setFilterCurso("");
        setFilterSede("");
        setFilterEstado("");
        if (onFilter) onFilter({ curso: "", sede: "", estado: "" });
    };


    // Registro de una nueva ofertas
    const handleNuevaOferta = async () => {
        try {
            if (!nuevaOferta.cursoId || !nuevaOferta.sedeId || !nuevaOferta.modalidadId || !nuevaOferta.horarioId || !nuevaOferta.periodoId || !nuevaOferta.coordinadorId) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            const response = await fetch("/api/ofertas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaOferta),
            });

            if (!response.ok) throw new Error("Error al registrar la oferta");

            const nueva = await response.json();
            setOfertas((prev) => [nueva, ...prev]);
            alert("Oferta registrada con éxito.");
            setOpenNueva(false);
        } catch (err) {
            console.error(err);
            alert("No fue posible registrar la oferta.");
        }
    };

    // Abrir ficha de oferta
    const handleOpenFicha = async (id, edit = false) => {
        setFichaId(id);
        setOpenFicha(true);
        setEditMode(edit);
        setFichaLoading(true);
        setFichaError("");
        setFichaData(null);
        try {
            const res = await fetch(`/api/ofertas/${id}`);
            if (!res.ok) throw new Error("Error al cargar la oferta");
            const data = await res.json();
            setFichaData(data);
        } catch (err) {
            setFichaError("No se pudo cargar la información de la oferta.");
        } finally {
            setFichaLoading(false);
        }
    };

    const handleCloseFicha = () => {
        setOpenFicha(false);
        setEditMode(false);
        setFichaData(null);
    };

    // Editar, guardar cambios en la ficha
    const handleSaveChanges = async () => {
        if (!fichaData) return;
        try {
            const response = await fetch(`/api/ofertas/${fichaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fichaData),
            });
            if (!response.ok) throw new Error("Error al guardar cambios");
            alert("Oferta actualizada con éxito");
            setOfertas((prev) => prev.map((o) => (o.ofertaId === fichaId ? { ...o, ...fichaData } : o)));
            handleCloseFicha();
        } catch (err) {
            alert("No fue posible guardar los cambios");
        }
    };

    // Cancelar oferta
    const handleCancelar = async (ofertaId) => {
        try {
            const confirmacion = confirm("¿Seguro que deseas cancelar esta oferta?");
            if (!confirmacion) return;

            const oferta = ofertas.find((o) => o.ofertaId === ofertaId);
            if (!oferta) {
                alert("No se encontró la oferta en el estado actual.");
                return;
            }

            if (oferta.accionId === 5) {
                alert("Esta oferta ya se encuentra cancelada.");
                return;
            }

            const response = await fetch(`/api/ofertas/${ofertaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...oferta, accionId: 5 }),
            });

            if (!response.ok) throw new Error("Error al cancelar la oferta");

            // Actualizar estado localmente
            setOfertas((prev) =>
                prev.map((o) => (o.ofertaId === ofertaId ? { ...o, accionId: 5 } : o))
            );

            alert("Oferta cancelada con éxito.");
        } catch (err) {
            console.error(err);
            alert("No fue posible cancelar la oferta.");
        }
    };

    if (loading || loadingCatalogos) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-blue-gray-600">
                <svg className="animate-spin h-6 w-6 text-[#2B338C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <Typography>Cargando catálogos y ofertas...</Typography>
            </div>
        );
    }

    return (

        <div className="p-4 space-y-4">

            {/* Formulario para registrar una nueva oferta */}

            <Dialog open={openNueva} handler={() => setOpenNueva(false)} size="lg">
                <DialogHeader className="text-[#2B338C] font-bold">Registrar Nueva Oferta</DialogHeader>
                <DialogBody className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Curso" value={nuevaOferta.cursoId} onChange={(v) => setNuevaOferta({ ...nuevaOferta, cursoId: Number(v) })}>
                            {cursos.map((c) => <Option key={c.cursoId} value={c.cursoId}>{c.nombre}</Option>)}
                        </Select>
                        <Select label="Sede" value={nuevaOferta.sedeId} onChange={(v) => setNuevaOferta({ ...nuevaOferta, sedeId: Number(v) })}>
                            {sedes.map((s) => <Option key={s.sedeId} value={s.sedeId}>{s.nombre}</Option>)}
                        </Select>
                        <Select
                            label="Modalidad"
                            value={nuevaOferta.modalidadId}
                            onChange={(v) => setNuevaOferta({ ...nuevaOferta, modalidadId: Number(v) })}
                        >
                            {modalidades
                                .filter((m) => [1, 2].includes(m.modalidadId)) // 🔹 solo presencial y virtual
                                .map((m) => (
                                    <Option key={m.modalidadId} value={m.modalidadId}>
                                        {m.nombre}
                                    </Option>
                                ))}
                        </Select>
                        <Select label="Horario" value={nuevaOferta.horarioId} onChange={(v) => setNuevaOferta({ ...nuevaOferta, horarioId: Number(v) })}>
                            {horario.map((h) => <Option key={h.horarioId} value={h.horarioId}>{`${h.dia} - ${h.rango}`}</Option>)}
                        </Select>
                        <Select label="Periodo" value={nuevaOferta.periodoId} onChange={(v) => setNuevaOferta({ ...nuevaOferta, periodoId: Number(v) })}>
                            {periodos.map((p) => <Option key={p.periodoId} value={p.periodoId}>{`${p.numero}Q - ${p.anio}`}</Option>)}
                        </Select>
                        <Select label="Coordinador" value={nuevaOferta.coordinadorId} onChange={(v) => setNuevaOferta({ ...nuevaOferta, coordinadorId: Number(v) })}>
                            {coordinadores.map((c) => <Option key={c.id} value={c.id}>{c.nombre}</Option>)}
                        </Select>
                        <div className="md:col-span-2">
                            <Input label="Comentarios" value={nuevaOferta.comentarios} onChange={(e) => setNuevaOferta({ ...nuevaOferta, comentarios: e.target.value })} />
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outlined" color="gray" onClick={() => setOpenNueva(false)} className="mr-2">Cancelar</Button>
                    <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleNuevaOferta}>Registrar</Button>
                </DialogFooter>
            </Dialog>

            {/* Encabezado y Acciones */}

            <div className="flex items-center justify-between gap-3">
                <div>
                    <Typography className="text-2xl font-extrabold text-[#2B338C]">Ofertas presenciales Y En Línea</Typography>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="import-presencial"
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setImportName(file ? file.name : "");
                        }}
                    />
                    <label htmlFor="import-presencial">
                        <Tooltip content="Importar desde CSV o Excel">
                            <Button variant="outlined" className="border-[#2B338C] text-[#2B338C] flex items-center gap-2">
                                <ArrowUpTrayIcon className="h-5 w-5" />
                                Importar
                            </Button>
                        </Tooltip>
                    </label>
                    {importName && (
                        <span className="text-xs text-blue-gray-600 truncate max-w-[180px]">{importName}</span>
                    )}

                    <Button className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2" onClick={() => setOpenNueva(true)}>
                        <PlusIcon className="h-5 w-5" /> Nueva oferta
                    </Button>
                </div>
            </div>

            {/* Filtros de busqueda */}

            <Card className="p-2 overflow-visible relative z-50">
                <div className="relative flex flex-wrap md:flex-nowrap items-center gap-2 overflow-visible py-1 px-1">
                    {/* Buscar */}
                    <div className="min-w-[280px] flex-shrink-0">
                        <Input
                            size="sm"
                            crossOrigin=""
                            label="Buscar (curso, sede, estado)"
                            icon={<MagnifyingGlassIcon className="h-4 w-4 text-blue-gray-500" />}
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>

                    {/* Curso */}
                    <div className="min-w-[260px] flex-shrink-0">
                        <Select
                            size="sm"
                            label="Curso"
                            value={filterCurso}
                            onChange={(v) => setFilterCurso(v || "")}
                            selected={() => (filterCurso ? getCursoNombre(Number(filterCurso)) : "Todos")}
                            menuProps={{
                                className:
                                    "z-[2147483647] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto min-w-[260px]",
                                keepMounted: true,
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-0" }}
                        >
                            <Option value="">Todos</Option>
                            {cursos.map((c) => (
                                <Option key={c.cursoId} value={String(c.cursoId)} className="bg-white">
                                    {c.nombre}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Sede */}
                    <div className="min-w-[180px] flex-shrink-0">
                        <Select
                            size="sm"
                            label="Sede"
                            value={filterSede}
                            onChange={(v) => setFilterSede(v || "")}
                            selected={() => (filterSede ? getSedeNombre(Number(filterSede)) : "Todas")}
                            menuProps={{
                                className:
                                    "z-[2147483647] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto",
                                keepMounted: true,
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-0" }}
                        >
                            <Option value="">Todas</Option>
                            {sedes.map((s) => (
                                <Option key={s.sedeId} value={String(s.sedeId)} className="bg-white">
                                    {s.nombre}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Coordinador */}
                    <div className="min-w-[220px] flex-shrink-0">
                        <Select
                            size="sm"
                            label="Coordinador"
                            value={filterCoordinador}
                            onChange={(v) => setFilterCoordinador(v || "")}
                            selected={() => (filterCoordinador ? getCoordinadorNombre(Number(filterCoordinador)) : "Todos")}
                            menuProps={{
                                className:
                                    "z-[2147483647] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto min-w-[220px]",
                                keepMounted: true,
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-0" }}
                        >
                            <Option value="">Todos</Option>
                            {coordinadores.map((c) => (
                                <Option key={c.id} value={String(c.id)} className="bg-white">
                                    {c.nombre}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Estado */}
                    <div className="min-w-[180px] flex-shrink-0">
                        <Select
                            size="sm"
                            label="Estado"
                            value={filterEstado}
                            onChange={(v) => setFilterEstado(v || "")}
                            selected={() =>
                                filterEstado
                                    ? estados.find((e) => String(e.accionId) === String(filterEstado))?.nombre ?? "Todos"
                                    : "Todos"
                            }
                            menuProps={{
                                className:
                                    "z-[2147483647] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-64 overflow-auto",
                                keepMounted: true,
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-0" }}
                        >
                            <Option value="">Todos</Option>
                            {estados.map((e) => (
                                <Option key={e.accionId} value={String(e.accionId)} className="bg-white">
                                    {e.nombre}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Filas por página */}
                    <div className="min-w-[120px] flex-shrink-0">
                        <Select
                            size="sm"
                            label="Filas"
                            value={String(rowsPerPage)}
                            onChange={(v) => {
                                setRowsPerPage(Number(v || 10));
                                setPage(1);
                            }}
                            selected={() => String(rowsPerPage)}
                            menuProps={{
                                className:
                                    "z-[2147483647] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)]",
                                keepMounted: true,
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-0" }}
                        >
                            <Option value="10">10</Option>
                            <Option value="20">20</Option>
                            <Option value="50">50</Option>
                        </Select>
                    </div>

                    {/* Botón limpiar */}
                    <div className="ml-auto flex-shrink-0">
                        <Button
                            size="sm"
                            variant="outlined"
                            className="border-[#2B338C] text-[#2B338C] font-semibold"
                            onClick={limpiarFiltros}
                        >
                            Limpiar
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Resumen de ofertas */}
            <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-[#2B338C]">
                    TOTAL: {filtered.length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-amber-600">
                    PENDIENTES: {filtered.filter(o => o.accionId === 2).length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-blue-600">
                    ENVIADAS: {filtered.filter(o => o.accionId === 1).length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-green-600">
                    ACEPTADAS: {filtered.filter(o => o.accionId === 3).length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-red-600">
                    RECHAZADAS: {filtered.filter(o => o.accionId === 4).length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-gray-600">
                    CANCELADAS: {filtered.filter(o => o.accionId === 5).length}
                </span>
            </div>

            {/* Tabla de Ofertas */}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full text-left">
                        <thead className="bg-blue-gray-50 text-blue-gray-700">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Curso</th>
                                <th className="p-3">Sede</th>
                                <th className="p-3">Modalidad</th>
                                <th className="p-3">Horario</th>
                                <th className="p-3">Periodo</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3">Coordinador</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((o) => (
                                <tr key={o.ofertaId} className="border-b">
                                    <td className="p-3">{getCursoId(o.cursoId)}</td>
                                    <td className="p-3">{getCursoNombre(o.cursoId)}</td>
                                    <td className="p-3">{getSedeNombre(o.sedeId)}</td>
                                    <td className="p-3">{getModalidadNombre(o.modalidadId)}</td>
                                    <td className="p-3">{getHorarioNombre(o.horarioId)}</td>
                                    <td className="p-3">{getPeriodoNombre(o.periodoId)}</td>
                                    <td className="p-3">{getEstadoNombre(o.accionId)}</td>
                                    <td className="p-3">{getCoordinadorNombre(o.coordinadorId)}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content="Ver detalle">
                                                <Button size="sm" variant="outlined" onClick={() => handleOpenFicha(o.ofertaId, false)} className="border-[#2B338C] text-[#2B338C] p-2"><EyeIcon className="h-4 w-4" /></Button>
                                            </Tooltip>
                                            <Tooltip content="Editar oferta">
                                                <Button size="sm" className="bg-[#FFDA00] text-[#2B338C] p-2" onClick={() => handleOpenFicha(o.ofertaId, true)}><PencilSquareIcon className="h-4 w-4" /></Button>
                                            </Tooltip>
                                            <Tooltip content="Cancelar oferta">
                                                <Button size="sm" variant="outlined" className="border-red-500 text-red-600 p-2" onClick={() => handleCancelar(o.ofertaId)}><XCircleIcon className="h-4 w-4" /></Button>
                                            </Tooltip>
                                            <Tooltip content="Enviar a docente">
                                                <Button size="sm" variant="outlined" className="border-green-600 text-green-700 p-2"><PaperAirplaneIcon className="h-4 w-4" /></Button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

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

                </div>
            </Card >

            {/* Modal reutilizable */}
            < Dialog open={openFicha} handler={handleCloseFicha} size="lg" >
                <DialogHeader className="text-[#2B338C]">{editMode ? `Editar Oferta - ${fichaId}` : `Oferta - ${fichaId}`}</DialogHeader>
                <DialogBody className="space-y-4">
                    {fichaLoading && <Typography className="text-blue-gray-600">Cargando...</Typography>}
                    {fichaError && <Typography className="text-red-600">{fichaError}</Typography>}
                    {!fichaLoading && fichaData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {editMode ? (
                                <>
                                    <Select label="Curso" value={fichaData.cursoId} onChange={(v) => setFichaData({ ...fichaData, cursoId: Number(v) })}>
                                        {cursos.map((c) => <Option key={c.cursoId} value={c.cursoId}>{c.nombre}</Option>)}
                                    </Select>
                                    <Select label="Sede" value={fichaData.sedeId} onChange={(v) => setFichaData({ ...fichaData, sedeId: Number(v) })}>
                                        {sedes.map((s) => <Option key={s.sedeId} value={s.sedeId}>{s.nombre}</Option>)}
                                    </Select>
                                    <Select label="Modalidad" value={fichaData.modalidadId} onChange={(v) => setFichaData({ ...fichaData, modalidadId: Number(v) })}>
                                        {modalidades.map((m) => <Option key={m.modalidadId} value={m.modalidadId}>{m.nombre}</Option>)}
                                    </Select>
                                    <Select label="Horario" value={fichaData.horarioId} onChange={(v) => setFichaData({ ...fichaData, horarioId: Number(v) })}>
                                        {horario.map((h) => <Option key={h.horarioId} value={h.horarioId}>{h.rango}</Option>)}
                                    </Select>
                                    <Select label="Periodo" value={fichaData.periodoId} onChange={(v) => setFichaData({ ...fichaData, periodoId: Number(v) })}>
                                        {periodos.map((p) => <Option key={p.periodoId} value={p.periodoId}>{`${p.numero} - ${p.anio}`}</Option>)}
                                    </Select>
                                    <Select label="Coordinador" value={fichaData.coordinadorId} onChange={(v) => setFichaData({ ...fichaData, coordinadorId: Number(v) })}>
                                        {coordinadores.map((c) => <Option key={c.id} value={c.id}>{c.nombre}</Option>)}
                                    </Select>
                                    <Input label="Comentarios" value={fichaData.comentarios ?? ""} onChange={(e) => setFichaData({ ...fichaData, comentarios: e.target.value })} />
                                </>
                            ) : (
                                <>
                                    <div><p className="text-blue-gray-500 text-sm">Curso</p><p className="font-semibold">{fichaData.curso?.nombre ?? getCursoNombre(fichaData.cursoId)}</p></div>
                                    <div><p className="text-blue-gray-500 text-sm">Sede</p><p className="font-semibold">{fichaData.sede?.nombre ?? getSedeNombre(fichaData.sedeId)}</p></div>
                                    <div><p className="text-blue-gray-500 text-sm">Modalidad</p><p className="font-semibold">{fichaData.modalidad?.nombre ?? getModalidadNombre(fichaData.modalidadId)}</p></div>
                                    <div><p className="text-blue-gray-500 text-sm">Horario</p><p className="font-semibold">{fichaData.horario?.descripcion ?? getHorarioNombre(fichaData.horarioId)}</p></div>
                                    <div><p className="text-blue-gray-500 text-sm">Periodo</p><p className="font-semibold">{fichaData.periodo?.nombre ?? getPeriodoNombre(fichaData.periodoId)}</p></div>
                                    <div><p className="text-blue-gray-500 text-sm">Coordinador</p><p className="font-semibold">{fichaData.coordinador?.nombre ?? getCoordinadorNombre(fichaData.coordinadorId)}</p></div>
                                    <div className="md:col-span-2"><p className="text-blue-gray-500 text-sm">Comentarios</p><p className="font-semibold">{fichaData.comentarios ?? "—"}</p></div>
                                </>
                            )}
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    {editMode ? (
                        <>
                            <Button variant="outlined" onClick={handleCloseFicha} className="border-[#2B338C] text-[#2B338C] mr-2">Cancelar</Button>
                            <Button className="bg-[#FFDA00] text-[#2B338C]" onClick={handleSaveChanges}>Guardar</Button>
                        </>
                    ) : (
                        <Button variant="text" className="bg-[#FFDA00] text-[#2B338C]" onClick={handleCloseFicha}>Cerrar</Button>
                    )}
                </DialogFooter>
            </Dialog >
        </div >
    );
}