import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip, Input, Select, Option } from "@material-tailwind/react";
import { PaperAirplaneIcon, XCircleIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

// Componentes Personalizados UI.
import { FormButton, ArchiveButton, DuplicateButton, ViewButton, EditButton, CancelButton, SendButton} from "@/components/ui/Buttons";
import PageTitle from "@/components/ui/Title/PageTitle";

// Importar Modals
import DuplicarOfertasModal from "./modals/DuplicarOfertasModal";
import ArchivarOfertasModal from "./modals/ArchivarOfertasModal";
import FichaOfertaModal from "./modals/FichaOfertaModal";

// Importar Funciones
import { CatalogosNormalizados } from "@/pages/ofertas/functions/CatalogosNormalizados";
import { OpenFichaOferta, CancelarOferta, GuardarOferta } from "@/pages/ofertas/functions";
import { accionChips, estadoChips } from "@/pages/ofertas/Components/EstadosAccionesChips";

// Importar Hooks
import { useArchivarPorModalidad } from "@/pages/ofertas/hooks/useArchivarPorModalidad";
import { useDuplicarOfertas } from "@/pages/ofertas/hooks/useDuplicarOfertas";
import { useCatalogosOfertas } from "@/pages/ofertas/hooks/useCatalogosOfertas";

const API = import.meta.env.VITE_API_BASE ?? "";
const URL = {
    personas: `${API}/api/personas`,
};

const matches = (t, q) =>
    !q || String(t ?? "").toLowerCase().includes(String(q ?? "").toLowerCase());


export default function OfertasEnLinea() {

    // Estados de datos de ofertas
    const [ofertas, setOfertas] = useState([]);

    //----------------------------------------------------------------------------
    // Cargar catálogos
    //----------------------------------------------------------------------------
    const {
        cursos,
        sedes,
        modalidades,
        horarios: horario,
        periodos,
        coordinadores,
        estados,
        estadoOferta,
        loading: loadingCatalogos
    } = useCatalogosOfertas();

    //----------------------------------------------------------------------------
    // Funciones de Normalización de los catalogos.
    //----------------------------------------------------------------------------
    const normalizadores = CatalogosNormalizados({
        cursos,
        sedes,
        modalidades,
        horarios: horario,
        periodos,
        coordinadores,
        estados
    });

    const {
        matchCursoId,
        matchSedeId,
        matchModalidadId,
        matchHorarioId,
        getHorarioNombre,
        getDiaNombre,
        getHoraNombre,
        matchPeriodoId,
        matchCoordinadorId,
        getCoordinadorNombre,
        getCoordinadorPrimerApellido,
        getCoordinadorSegundoApellido,
        getCursoNombrePorCodigo,
        matchAccionIdDesdeEstadoOAccion
    } = normalizadores;

    const [loading, setLoading] = useState(true);
    const [setError] = useState(null);

    // Estados de formulario ---
    const [fichaId, setFichaId] = useState(null);
    const [fichaData, setFichaData] = useState(null);
    const [fichaForm, setFichaForm] = useState(null);
    const [fichaLoading, setFichaLoading] = useState(false);
    const [fichaError, setFichaError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [isNuevo, setIsNuevo] = useState(false);

    //----------------------------------------------------------------------------
    // Filtrado y busqueda
    //----------------------------------------------------------------------------

    // Filtros de campos
    const [term, setTerm] = useState("");
    const [filterCurso, setFilterCurso] = useState("");
    const [filterSede, setFilterSede] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [filterCoordinador, setFilterCoordinador] = useState("");

    // Filtrado por lo campos
    // Cuenta con el ordenamiento por Id (Registros mas nuevos de primero)
    const filtered = useMemo(() => {
        try {
            return [...ofertas]
                .sort((a, b) => b.ofertaId - a.ofertaId)
                .filter((o) => {
                    // Comparaciones directas por string
                    const matchCurso = filterCurso ? o.curso === filterCurso : true;
                    const matchSede = filterSede ? o.sede === filterSede : true;
                    const matchEstado = filterEstado ? o.estado === filterEstado : true;
                    const matchCoordinador = filterCoordinador
                        ? o.coordinadorId === Number(filterCoordinador)
                        : true;

                    // Búsqueda libre
                    const texto = `
          ${o.curso} ${o.sede} ${o.modalidad}
          ${getHorarioNombre(o.horarioId)}
          ${getCursoNombrePorCodigo(o.curso)}          
          ${o.periodo} ${o.accion}
          ${getCoordinadorNombre(o.coordinadorId)}
          ${o.estado}
        `.toLowerCase();

                    const termMatch = term ? texto.includes(term.toLowerCase()) : true;

                    return matchCurso && matchSede && matchEstado && matchCoordinador && termMatch;
                });
        } catch (err) {
            console.error("Error al aplicar filtros:", err);
            return ofertas;
        }
    }, [
        ofertas,
        filterCurso,
        filterSede,
        filterEstado,
        filterCoordinador,
        term,
        getHorarioNombre,
        getCoordinadorNombre,
    ]);

    // Limpieza de filtros
    const limpiarFiltros = () => {
        setFilterCurso("");
        setFilterSede("");
        setFilterEstado("");
        setFilterCoordinador("");
    };
    //----------------------------------------------------------------------------
    // Paginación
    //----------------------------------------------------------------------------

    // Configuración de paginación
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Cálculo de totales y páginas disponibles
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    //  Segmentación de datos a mostrar
    const currentData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    const [openFicha, setOpenFicha] = useState(false);

    const [modo, setModo] = useState("ver");

    const [openEnviar, setOpenEnviar] = useState(false);
    const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
    const [docenteId, setDocenteId] = useState("");
    const [enviando, setEnviando] = useState(false);

    // Docentes para enviar oferta
    const [docentes, setDocentes] = useState([]);
    const [docentesLoading, setDocentesLoading] = useState(false);
    const [docentesError, setDocentesError] = useState("");
    const [filtroDocente, setFiltroDocente] = useState("");

    const getNombreHorario = (horarioId) =>
        horario.find(h => h.horarioId === horarioId)
            ? `${horario.find(h => h.horarioId === horarioId).dia} - ${horario.find(h => h.horarioId === horarioId).rango}`
            : "Horario";

    const docentesFiltrados = useMemo(
        () =>
            docentes.filter(d =>
                matches(
                    `${d.nombre} ${d.primerApellido} ${d.segundoApellido} ${d.cedula} ${d.correo}`,
                    filtroDocente
                )
            ),
        [docentes, filtroDocente]
    );

    const getNombreDocente = useCallback(
        (id) => {
            const d = docentes.find(doc => String(doc.id) === String(id));
            if (!d) return "Docente";
            return `${d.nombre} ${d.primerApellido} ${d.segundoApellido}`.trim();
        },
        [docentes]
    );


    //----------------------------------------------------------------------------
    // : Obtener listado de ofertas (Filtrado por modalidad en línea).
    //----------------------------------------------------------------------------

    const fetchOfertas = async () => {
        try {
            // Llamada al endpoint para obtener las ofertas.
            setLoading(true);
            const res = await fetch("/api/ofertas");
            const data = await res.json();

            // Filtrar solo modalidad en línea
            const modalidadesFiltrar = ['En Línea'];
            const ofertasFiltradas = (data || []).filter((o) =>
                modalidadesFiltrar.includes(o.modalidad) && o.archivados !== true
            );

            // Almancenar ofertas.
            setOfertas(ofertasFiltradas);

        } catch (Error) {

            // Manejo de error: Temporal: Cambiar a SweetAlert.
            console.error(Error);
            setError("No se pudieron cargar las ofertas.");

        } finally {
            setLoading(false);
        }
    };

    // Cargar las ofertas al montar el componente.
    useEffect(() => {
        fetchOfertas();
    }, []);

    useEffect(() => {
        const loadDocentes = async () => {
            setDocentesLoading(true);
            setDocentesError("");
            try {
                const r = await fetch(URL.personas);
                if (!r.ok) throw new Error("Error al cargar docentes.");
                const json = await r.json();
                const arr = Array.isArray(json)
                    ? json
                    : (json.data ?? json.items ?? json.result ?? json.results ?? []);
                const safe = Array.isArray(arr) ? arr : [];

                const mapped = safe.map(x => ({
                    id: x.id ?? x.personaId,
                    nombre: x.nombre ?? "",
                    primerApellido: x.primerApellido ?? "",
                    segundoApellido: x.segundoApellido ?? "",
                    cedula: x.cedula ?? x.identificacion ?? "",
                    correo: x.correo ?? x.email ?? "",
                }));

                setDocentes(mapped);
            } catch (e) {
                console.error(e);
                setDocentesError("No se pudieron cargar los docentes.");
            } finally {
                setDocentesLoading(false);
            }
        };

        loadDocentes();
    }, []);


    // ----------------------------------------------------------------------------
    //  Funcionalidad Completa (Abrir, Cerrar, Guardar cambios).
    //            Ficha de Oferta compartida (ver y editar).
    // ----------------------------------------------------------------------------

    // Deshabilitar campos en caso que el estado de la oferta se encuentre en cancelada.
    const OfertaCancelada =
        fichaForm?.estadoOfertaId === 5 || // ID es 5 (cancelado)
        fichaData?.estadoOfertaId === 5 || // Respaldo en fichaData
        (typeof fichaData?.estado === "string" &&
            fichaData.estado.toLowerCase().trim() === "cancelada");  // Respaldo en texto

    // Funcionalidad Abrir Nueva Oferta
    const handleOpenNueva = () => {
        // Inicializar estados
        setIsNuevo(true);
        setEditMode(true);
        setOpenFicha(true);

        // Limpiar formulario 
        setFichaForm({
            cursoId: "",
            sedeId: "",
            horarioId: "",
            periodoId: "",
            coordinadorId: "",
            comentarios: "",
            accionId: 1, // Por defecto: Abrir Curso
            modalidadId: 3,
            estadoOfertaId: 2 // Por defecto: Pendiente
        });
    };

    // Funcionalidad Abrir Ficha. -- FINALIZADO EN OPTIMIZACIÓN
    const handleOpenFicha = async (id, edit = false) => {
        setIsNuevo(false);
        setFichaId(id);
        setOpenFicha(true);
        setEditMode(edit);
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

        if (!result.ok) {
            setFichaError(result.error);
            setFichaLoading(false);
            return;
        }

        setFichaData(result.data);
        setFichaForm(result.fichaForm);
        setFichaLoading(false);
    };

    // Cerrar ficha.
    const handleCloseFicha = () => {
        setOpenFicha(false);
        setEditMode(false);
        setIsNuevo(false);
        setFichaData(null);
        setFichaForm(null);
    };

    // Registrar nueva oferta
    const handleRegistrar = async () => {
        const result = await GuardarOferta(null, fichaForm);

        if (!result.ok) {
            alert(result.error);
            return;
        }

        alert("Oferta registrada correctamente.");
        handleCloseFicha();
        fetchOfertas();
    };

    // Guardar cambios en oferta
    const handleGuardar = async () => {
        if (!fichaForm) return;

        const result = await GuardarOferta(fichaId, fichaForm);

        if (!result.ok) {
            alert(result.error);
            return;
        }

        alert("Oferta actualizada correctamente.");
        handleCloseFicha();
        fetchOfertas();
    };
    //----------------------------------------------------------------------------
    // Cancelar oferta. --> FINALIZADO EN OPTIMIZACIÓN
    //----------------------------------------------------------------------------

    const handleCancelar = async (ofertaId) => {
        const confirmar = confirm("¿Seguro que deseas cancelar esta oferta?");
        if (!confirmar) return;

        const oferta = ofertas.find(o => o.ofertaId === ofertaId);

        const result = await CancelarOferta(oferta, {
            matchCursoId,
            matchSedeId,
            matchModalidadId,
            matchHorarioId,
            matchPeriodoId,
            matchCoordinadorId,
            matchAccionIdDesdeEstadoOAccion,
        });

        if (!result.ok) {
            alert(result.error);
            return;
        }

        // Actualizar estado local
        setOfertas(prev =>
            prev.map(o =>
                o.ofertaId === ofertaId ? result.updatedOferta : o
            )
        );

        alert("Oferta cancelada correctamente.");
    };

    //----------------------------------------------------------------------------
    // Enviar oferta a docente
    //----------------------------------------------------------------------------

    const handleAbrirEnviar = (oferta) => {
        setOfertaSeleccionada(oferta);
        setDocenteId("");
        setOpenEnviar(true);
    };

    const handleCerrarEnviar = () => {
        setOpenEnviar(false);
        setOfertaSeleccionada(null);
        setDocenteId("");
    };

    const handleEnviarOferta = async () => {
        if (!ofertaSeleccionada) {
            alert("No hay una oferta seleccionada.");
            return;
        }

        if (!docenteId) {
            alert("Debe seleccionar el docente al que se enviará la oferta.");
            return;
        }

        try {
            setEnviando(true);

            const response = await fetch("/api/SolicitudesOferta", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ofertaId: ofertaSeleccionada.ofertaId,
                    personaId: Number(docenteId),
                }),
            });

            if (!response.ok) throw new Error("Error al enviar la oferta al docente.");

            setOfertas(prev =>
                prev.map(o =>
                    o.ofertaId === ofertaSeleccionada.ofertaId
                        ? { ...o, estado: "Enviada", estadoOfertaId: 1 }
                        : o
                )
            );

            alert("La oferta fue enviada al docente correctamente.");

            handleCerrarEnviar();
            await fetchOfertas(); // refrescar estados si cambian

        } catch (error) {
            console.error(error);
            alert("No fue posible enviar la oferta al docente.");
        } finally {
            setEnviando(false);
        }
    };

    //----------------------------------------------------------------------------
    // Funcionalidad de archivar ofertas por periodo -- FINALIZADO EN OPTIMIZACIÓN
    // ---------------------------------------------------------------------------

    const {
        openModal,
        setOpenModal,
        tipoPeriodo,
        setTipoPeriodo,
        selectedPeriodo,
        setSelectedPeriodo,
        selectedModalidad,
        setSelectedModalidad,
        periodosDisponibles,
        archivarPorModalidad,
        loadingArchivar,
        mensajeArchivar,
    } = useArchivarPorModalidad(periodos, fetchOfertas);

    useEffect(() => {
        if (openModal) {
            setSelectedModalidad("3");
            setSelectedPeriodo("");
        }
    }, [openModal]);

    //----------------------------------------------------------------------------
    // Funcionalidad de duplicar ofertas por periodo -- FINALIZADO EN OPTIMIZACIÓN
    //----------------------------------------------------------------------------

    const {
        openDuplicarModal,
        setOpenDuplicarModal,
        abrirModalDuplicar,

        tipoPeriodo: tipoPeriodoDuplicar,
        setTipoPeriodo: setTipoPeriodoDuplicar,

        periodoOrigen,
        setPeriodoOrigen,

        periodoDestino,
        setPeriodoDestino,

        modalidad,
        setModalidad,

        loadingDuplicar,
        mensajeDuplicar,

        periodosOrigenFiltrados,
        periodosDestinoFiltrados,

        duplicarOfertas,
    } = useDuplicarOfertas(periodos, fetchOfertas);

    //----------------------------------------------------------------------------
    // Renderizado de datos
    //----------------------------------------------------------------------------

    if (loading || loadingCatalogos) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-blue-gray-600">
                <svg className="animate-spin h-6 w-6 text-[#2B338C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <Typography>Cargando datos de Ofertas ...</Typography>
            </div>
        );
    }

    // ---------------------------------------------------------------------------
    // Personalización:
    // ---------------------------------------------------------------------------

    const renderDocenteOptions = () => {
        if (docentesLoading) {
            return (
                <Option key="loading" disabled>
                    Cargando docentes...
                </Option>
            );
        }

        if (!docentesLoading && docentesFiltrados.length === 0) {
            return (
                <Option key="empty" disabled>
                    Sin resultados
                </Option>
            );
        }

        return docentesFiltrados.map((d) => (
            <Option key={d.id} value={String(d.id)}>
                {`${d.nombre} ${d.primerApellido} ${d.segundoApellido}`.trim()} — {d.cedula}
            </Option>
        ));
    };

    return (

        <div className="p-4 space-y-4">

            {/* Tabla de registros e importar */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <PageTitle>Ofertas 100% Virtual</PageTitle>
                </div>

                <div className="flex items-center gap-2">

                    {/* Botón para registar una nueva oferta */}
                    <FormButton onClick={handleOpenNueva}>Nueva oferta</FormButton>

                    {/* Botón para archivar */}
                    <ArchiveButton onClick={() => setOpenModal(true)}>
                        Archivar Ofertas
                    </ArchiveButton>

                    {/* Botón para duplicar */}
                    <DuplicateButton onClick={abrirModalDuplicar}>
                        Duplicar ofertas del periodo
                    </DuplicateButton>

                </div>
            </div>

            {/* Filtros de busqueda */}
            <Card className="p-4 border border-gray-200 shadow-md bg-white relative z-[50]">
                <div className="flex flex-wrap gap-3 items-end">

                    {/*Búsqueda general */}
                    <div className="flex-1 min-w-[250px]">
                        <Input
                            size="md"
                            label="Buscar palabra clave"
                            icon={<MagnifyingGlassIcon className="h-5 w-5 text-[#2B338C]" />}
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>

                    {/*Curso */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="md"
                            label="Curso"
                            value={filterCurso}
                            onChange={(v) => setFilterCurso(v || "")}
                            selected={() => (filterCurso ? filterCurso : "Todos")}
                            menuProps={{
                                className:
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto min-w-[220px]",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todos</Option>
                            {Array.from(new Set(ofertas.map(o => o.curso))).map((curso) => (
                                <Option key={curso} value={curso} className="bg-white">
                                    {curso}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Sede */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="md"
                            label="Sede"
                            value={filterSede}
                            onChange={(v) => setFilterSede(v || "")}
                            selected={() => (filterSede ? filterSede : "Todas")}
                            menuProps={{
                                className:
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto min-w-[220px]",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todas</Option>
                            {Array.from(new Set(ofertas.map(o => o.sede))).map((sede) => (
                                <Option key={sede} value={sede} className="bg-white">
                                    {sede}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/*Estado */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="md"
                            label="Estado"
                            value={filterEstado}
                            onChange={(v) => setFilterEstado(v || "")}
                            selected={() => (filterEstado ? filterEstado : "Todos")}
                            menuProps={{
                                className:
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto min-w-[220px]",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todos</Option>
                            {Array.from(new Set(ofertas.map(o => o.estado))).map((estado) => (
                                <Option key={estado} value={estado} className="bg-white">
                                    {estado}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/*Coordinador */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="md"
                            label="Coordinador"
                            value={filterCoordinador}
                            onChange={(v) => setFilterCoordinador(v || "")}
                            selected={() =>
                                filterCoordinador
                                    ? getCoordinadorNombre(Number(filterCoordinador))
                                    : "Todos"
                            }
                            menuProps={{
                                className:
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto min-w-[220px]",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todos</Option>
                            {coordinadores.map((c) => (
                                <Option key={c.id} value={String(c.id)} className="bg-white">
                                    {c.nombre}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/*Paginación selector */}
                    <div className="min-w-[120px] flex-shrink-0">
                        <Select
                            size="md"
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

                    {/*Limpiar */}
                    <div className="flex-shrink-0 relative z-[50]">
                        <Button
                            variant="outlined"
                            onClick={limpiarFiltros}
                            className="border-[#2B338C] text-[#2B338C] text-md flex items-center gap-2 hover:bg-[#2B338C]/10 transition-all"
                        >
                            <XCircleIcon className="h-4 w-4" />
                            Limpiar
                        </Button>
                    </div>

                    {/*Refrescar */}
                    <div className="flex-shrink-0">
                        <Button
                            variant="outlined"
                            onClick={fetchOfertas}
                            className="border-green-600 text-green-700 flex items-center gap-2"
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                            Refrescar
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Resumen de ofertas: Chips de Estados */}
            <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-[#2B338C]">
                    TOTAL: {filtered.length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-amber-600">
                    PENDIENTES: {filtered.filter(o => o.estado === "Pendiente").length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-blue-600">
                    ENVIADAS: {filtered.filter(o => o.estado === "Enviada").length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-green-600">
                    ACEPTADAS: {filtered.filter(o => o.estado === "Aceptada").length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-red-600">
                    RECHAZADAS: {filtered.filter(o => o.estado === "Rechazada").length}
                </span>

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-gray-600">
                    CANCELADAS: {filtered.filter(o => o.estado === "Cancelada").length}
                </span>
            </div>

            {/* Tabla de Ofertas */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full text-left">
                        <thead className="bg-blue-gray-50 text-blue-gray-700">
                            <tr>
                                <th className="p-3">Sede</th>
                                <th className="p-3">Código Curso</th>
                                <th className="p-3">Nombre Curso</th>
                                <th className="p-3">Grupo</th>
                                <th className="p-3">Día</th>
                                <th className="p-3">Horario</th>
                                <th className="p-3">Periodo</th>
                                <th className="p-3">Coordinador</th>
                                <th className="p-3">Modalidad</th>

                                <th className="p-3">Acciones</th>
                                <th className="p-3">Estado Oferta</th>
                                <th className="p-3">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((o) => (
                                <tr key={o.ofertaId} className="border-b">
                                    <td className="p-3">{o.sede}</td>
                                    <td className="p-3">{o.curso}</td>
                                    <td className="p-3">{getCursoNombrePorCodigo(o.curso)}</td>
                                    <td className="p-3">{o.grupo}</td>
                                    <td className="p-3">{getDiaNombre(o.horarioId)}</td>
                                    <td className="p-3">{getHoraNombre(o.horarioId)}</td>
                                    <td className="p-3">{o.periodo}</td>
                                    <td className="p-3">{getCoordinadorNombre(o.coordinadorId)} {getCoordinadorPrimerApellido(o.coordinadorId)} {getCoordinadorSegundoApellido(o.coordinadorId)}</td>
                                    <td className="p-3">{o.modalidad}</td>
                                    <td className="p-3">{accionChips(o.accion)}</td>
                                    <td className="p-3">{estadoChips(o.estado)}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content="Ver detalle">
                                                <ViewButton onClick={() => handleOpenFicha(o.ofertaId, false)} />
                                            </Tooltip>

                                            <Tooltip content="Editar oferta">
                                                <EditButton onClick={() => handleOpenFicha(o.ofertaId, true)} />
                                            </Tooltip>

                                            <Tooltip content="Cancelar oferta">
                                                <CancelButton onClick={() => handleCancelar(o.ofertaId)} />
                                            </Tooltip>

                                            <Tooltip content="Enviar a docente">
                                                <SendButton onClick={() => handleAbrirEnviar(o)} />
                                            </Tooltip>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Paginación */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3">
                        <span className="text-md text-blue-gray-600">
                            Mostrando <b>{total === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, total)}</b> de <b>{total}</b>
                        </span>
                        <div className="flex items-center gap-1">
                            <Button variant="outlined" size="md" className="border-[#2B338C] text-[#2B338C] px-3" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <span className="px-2 text-md">Página <b>{page}</b> de <b>{totalPages}</b></span>
                            <Button variant="outlined" size="md" className="border-[#2B338C] text-[#2B338C] px-3" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                </div>
            </Card >

            {/* Modal compartido: Funciones de Ver/Editar/Registar */}
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
                horarios={horario}
                tipoPeriodo={fichaForm?.tipoPeriodo || ""}
                setTipoPeriodo={(v) => setFichaForm(prev => ({ ...prev, tipoPeriodo: v }))}
                periodos={periodos}
                coordinadores={coordinadores}
                estados={estados}

                setFichaForm={setFichaForm}
                onGuardar={handleGuardar}
                onRegistrar={handleRegistrar}

                accionChips={accionChips}
                estadoChips={estadoChips}
            />

            {/* Modal: Enviar oferta a docente */}
            <Dialog
                open={openEnviar}
                handler={handleCerrarEnviar}
                size="md"
                className="rounded-xl shadow-xl bg-white"
            >
                <DialogHeader className="bg-[#2B338C] text-white font-semibold text-base px-6 py-3 rounded-t-xl flex items-center gap-2 shadow-md">
                    <span className="w-2.5 h-2.5 bg-[#FFDA00] rounded-full"></span>
                    Enviar oferta a docente
                </DialogHeader>

                <DialogBody className="p-6 bg-gray-50 border-x border-b border-gray-200 space-y-4">
                    {!ofertaSeleccionada ? (
                        <Typography className="text-md text-blue-gray-700">
                            No hay una oferta seleccionada.
                        </Typography>
                    ) : (
                        <>
                            {/* Selección de docente */}
                            <div className="grid grid-cols-1 gap-3">
                                <Input
                                    label="Buscar docente por nombre, apellidos o cédula"
                                    value={filtroDocente}
                                    onChange={(e) => setFiltroDocente(e.target.value)}
                                    size="md"
                                />

                                <Select
                                    label="Docente"
                                    value={docenteId ? String(docenteId) : ""}
                                    onChange={(v) => setDocenteId(v || "")}
                                    menuProps={{ className: "max-h-64 overflow-auto" }}
                                >
                                    {renderDocenteOptions()}
                                </Select>

                                {docentesError && (
                                    <Typography className="text-xs text-red-600 mt-1">
                                        {docentesError}
                                    </Typography>
                                )}
                            </div>

                            {/* Previsualización del correo */}
                            <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 max-h-80 overflow-auto">
                                <Typography className="text-[#2B338C] font-bold text-md mb-2">
                                    Previsualización del correo
                                </Typography>
                                <pre className="whitespace-pre-wrap text-md text-blue-gray-800 font-mono">
                                    {`Estimado(a) ${docenteId ? getNombreDocente(docenteId) : "Nombre del docente"},

                                    La Universidad Fidélitas le ofrece la siguiente carga:

                                    - Curso: ${ofertaSeleccionada.curso}
                                    - Sede: ${ofertaSeleccionada.sede}
                                    - Modalidad: ${ofertaSeleccionada.modalidad}
                                    - Período: ${ofertaSeleccionada.periodo}
                                    - Horario: ${getNombreHorario(ofertaSeleccionada.horarioId)}
                                    - Grupo: ${ofertaSeleccionada.grupo ?? ""}
                                    - Cupo: ${ofertaSeleccionada.cupo ?? "N/A"} estudiantes

                                    En el correo real se incluirán los enlaces para aceptar o rechazar la oferta.

                                    Saludos cordiales,
                                    Coordinación Académica`}
                                </pre>
                            </div>
                        </>
                    )}
                </DialogBody>

                <DialogFooter className="bg-gray-50 border-t border-gray-200 px-5 py-3 rounded-b-xl flex justify-end gap-2">
                    <Button
                        variant="outlined"
                        className="border-[#2B338C] text-[#2B338C]"
                        onClick={handleCerrarEnviar}
                        disabled={enviando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="bg-green-600 text-white font-semibold flex items-center gap-2"
                        onClick={handleEnviarOferta}
                        disabled={enviando || !ofertaSeleccionada}
                    >
                        {enviando ? "Enviando..." : "Enviar oferta"}
                        <PaperAirplaneIcon className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Modal: Archivar ofertas por periodo */}
            <ArchivarOfertasModal
                open={openModal}
                onClose={() => setOpenModal(false)}

                tipoPeriodo={tipoPeriodo}
                setTipoPeriodo={setTipoPeriodo}

                selectedPeriodo={selectedPeriodo}
                setSelectedPeriodo={setSelectedPeriodo}

                periodosDisponibles={periodosDisponibles}

                loadingArchivar={loadingArchivar}

                onArchivar={archivarPorModalidad}
            />

            {/* Modal: Duplicar ofertas */}
            <DuplicarOfertasModal
                open={openDuplicarModal}
                onClose={() => setOpenDuplicarModal(false)}

                modalidad={modalidad}
                setModalidad={setModalidad}

                tipoPeriodo={tipoPeriodoDuplicar}
                setTipoPeriodo={setTipoPeriodoDuplicar}

                periodoOrigen={periodoOrigen}
                setPeriodoOrigen={setPeriodoOrigen}

                periodoDestino={periodoDestino}
                setPeriodoDestino={setPeriodoDestino}

                periodosOrigenFiltrados={periodosOrigenFiltrados}
                periodosDestinoFiltrados={periodosDestinoFiltrados}

                loading={loadingDuplicar}
                mensaje={mensajeDuplicar}

                onDuplicar={duplicarOfertas}
            />

        </div >
    );
}