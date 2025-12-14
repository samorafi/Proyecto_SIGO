import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip, Input, Select, Option, Chip } from "@material-tailwind/react";
import { EyeIcon, PencilSquareIcon, PaperAirplaneIcon, XCircleIcon, ArrowUpTrayIcon, PlusIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useCatalogosOfertas } from "@/hooks/useCatalogos";

const API = import.meta.env.VITE_API_BASE ?? "";
const URL = {
    personas: `${API}/api/personas`,
};

const matches = (t, q) =>
    !q || String(t ?? "").toLowerCase().includes(String(q ?? "").toLowerCase());

export default function OfertasPresencialesVirtuales() {

    // Estados de datos de ofertas
    const [ofertas, setOfertas] = useState([]);

    //----------------------------------------------------------------------------
    // Cargar catálogos desde el hook.
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

    // Funciones de normalización (De texto a ID)

    // Normalización: Cursos String a Id
    const matchCursoId = (valor) => {
        if (!valor) return "";
        const hit = cursos.find(c => c.codigo === valor || c.nombre === valor);
        return hit?.cursoId ?? "";
    };

    // Normalización: Sedes String a Id
    const matchSedeId = (valor) => {
        if (!valor) return "";
        const hit = sedes.find(s => s.nombre === valor);
        return hit?.sedeId ?? "";
    };

    // Normalización: Modalidad String a Id
    const matchModalidadId = (valor) => {
        if (!valor) return "";
        const hit = modalidades.find(m => m.nombre === valor);

        // Evitar Las Ofertas En Línea
        if (hit?.modalidadId === 3 || valor.toLowerCase().includes("línea")) return "";

        return hit?.modalidadId ?? "";
    };



    // Normalización: Horario String a Id
    const matchHorarioId = (valorTexto, valorId) => {
        if (valorId) return valorId;
        if (!valorTexto) return "";
        const hit = horario.find(h => `${h.dia} - ${h.rango}` === valorTexto || h.descripcion === valorTexto);
        return hit?.horarioId ?? "";
    };

    // Normalización: Horario Id a String
    const getHorarioNombre = useCallback(
        (id) => {
            const hora = horario.find((h) => h.horarioId === id);
            return hora ? `${hora.dia} - ${hora.rango}` : id;
        },
        [horario]
    );

    // Normalización: Periodos String a Id
    const matchPeriodoId = (valor) => {
        if (!valor) return "";
        // Soporta "2C, 2025" y "2Q - 2025"
        const byLabel = periodos.find(p =>
            [`${p.numero}C, ${p.anio}`, `${p.numero}Q - ${p.anio}`].includes(valor)
        );
        if (byLabel) return byLabel.periodoId;

        // fallback por partes (Separar fechas)
        const year = valor.match(/\d{4}/)?.[0];
        const num = valor.match(/\d+/)?.[0];
        const byParts = periodos.find(p => String(p.anio) === year && String(p.numero) === num);
        return byParts?.periodoId ?? "";
    };

    // Normalización: Coordinador String a Id
    const matchCoordinadorId = (valor) => {
        if (!valor) return "";
        const hit = coordinadores.find(c => c.nombre === valor);
        return hit?.id ?? "";
    };

    // Normalización: Coordinador Id a String
    const getCoordinadorNombre = useCallback(
        (id) => coordinadores.find((c) => c.id === id)?.nombre ?? id,
        [coordinadores]
    );

    // Normalización: Coordinador Id a String
    const getCoordinadorPrimerApellido = useCallback(
        (id) => coordinadores.find((c) => c.id === id)?.primerApellido ?? id,
        [coordinadores]
    );

    // Normalización: Coordinador Id a String
    const getCoordinadorSegundoApellido = useCallback(
        (id) => coordinadores.find((c) => c.id === id)?.segundoApellido ?? id,
        [coordinadores]
    );

    // Normalización: Acción / Estado String a Id
    const matchAccionIdDesdeEstadoOAccion = (estado, accion) => {
        const nombre = estado || accion;
        if (!nombre) return 2; // Pendiente por defecto
        const hit = estados.find(e => e.nombre === nombre);
        return hit?.accionId ?? 2;
    };

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
        if (onFilter) onFilter({ curso: "", sede: "", estado: "" });
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

            // Filtrar todo excepto las ofertas En Linea
            const modalidadExcluir = 'En Línea';
            const ofertasFiltradas = (data || []).filter((o) => o.modalidad !== modalidadExcluir);

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

    //----------------------------------------------------------------------------
    //  Registro de nueva oferta.
    //----------------------------------------------------------------------------

    const handleNuevaOferta = async () => {
        try {
            // Validar campos obligatorios
            const { cursoId, sedeId, modalidadId, horarioId, periodoId, coordinadorId } = fichaForm;

            if (!cursoId || !sedeId || !modalidadId || !horarioId || !periodoId || !coordinadorId) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            // Estructura del nuevo registro
            const nuevaOfertaPayload = {
                ...fichaForm,
                estadoOfertaId: 2 // Estado "Pendiente" por defecto
            };

            // Llamada al endpoint
            const response = await fetch("/api/ofertas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaOfertaPayload),
            });

            // Manejo de errores. Temporal: Cambiar a SweetAlert.
            if (!response.ok) throw new Error("Error al registrar la oferta");

            // Mensaje de éxito. Temporal: Cambiar a SweetAlert.
            alert("Oferta registrada correctamente.");

            // Cerrar modal y limpiar formulario
            handleCloseFicha();
            setFichaForm({
                cursoId: "",
                sedeId: "",
                modalidadId: "",
                horarioId: "",
                periodoId: "",
                coordinadorId: "",
                comentarios: "",
                accionId: 2,
                estadoOfertaId: 2,
            });

            // Refrescar lista
            await fetchOfertas();

        } catch (error) {

            // Habilitar solamente para pruebas
            // console.error(error);

            // Manejo de error: Temporal: Cambiar a SweetAlert.
            alert("No fue posible registrar la oferta.");
        }
    };

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
            modalidadId: "",
            estadoOfertaId: 2 // Por defecto: Pendiente
        });
    };

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


    // Funcionalidad Abrir Ficha.
    const handleOpenFicha = async (id, edit = false) => {

        // Inicializar estados
        setIsNuevo(false);
        setFichaId(id);
        setOpenFicha(true);
        setEditMode(edit);
        setFichaLoading(true);
        setFichaError("");
        setFichaData(null);
        setFichaForm(null);

        try {

            // Llamada al endpoint para obtener la oferta
            const res = await fetch(`/api/ofertas/${id}`);

            // Manejo de errores. Temporal: Cambiar a SweetAlert.
            if (!res.ok) throw new Error("Error al cargar la oferta");
            const data = await res.json();

            // Guardamos los datos (Los datos estan sin normalizar, se manejan mediante ID)
            setFichaData(data);

            // Construimos un meotodo de normalización para la funcionalidad editable (Convertimos de ID a String)
            const normalized = {
                cursoId: matchCursoId(data.curso) || data.cursoId || "",
                sedeId: matchSedeId(data.sede) || data.sedeId || "",
                modalidadId: matchModalidadId(data.modalidad) || data.modalidadId || 3,
                horarioId: matchHorarioId(data.horario, data.horarioId),
                periodoId: matchPeriodoId(data.periodo) || data.periodoId || "",
                coordinadorId: matchCoordinadorId(data.coordinador) || data.coordinadorId || "",
                comentarios: data.comentarios ?? "",
                accionId:
                    typeof data.accionId === "number"
                        ? data.accionId
                        : matchAccionIdDesdeEstadoOAccion(data.estado, data.accion),
                estadoOfertaId:
                    typeof data.estadoOfertaId === "number"
                        ? data.estadoOfertaId
                        : (
                            estadoOferta.find((e) => e.nombre === data.estado)?.estadoOfertaId
                            ?? 2
                        ),
                cupo:
                    typeof data.cupo === "number"
                        ? data.cupo
                        : (data.cupo ?? null),
                matriculados:
                    typeof data.matriculados === "number"
                        ? data.matriculados
                        : (data.matriculados ?? null),
            };


            // Guardamos los datos normalizados
            setFichaForm(normalized);

        } catch (error) {
            // Habilitar solamente para pruebas
            // console.error("Error al abrir ficha:", error);

            // Manejo de errores. Temporal: Cambiar a SweetAlert.
            setFichaError("No se pudo cargar la información de la oferta.");

        } finally {
            // Finalizamos la carga de la ficha
            setFichaLoading(false);
        }
    };

    // Cerrar ficha.
    const handleCloseFicha = () => {
        setOpenFicha(false);
        setEditMode(false);
        setIsNuevo(false);
        setFichaData(null);
        setFichaForm(null);
    };

    // Guardar cambios en la ficha.
    const handleSaveChanges = async () => {
        if (!fichaForm) return;

        try {

            // Llamada al endpoint para guardar los cambios
            const response = await fetch(`/api/ofertas/${fichaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fichaForm),
            });

            // Manejo de errores. Temporal: Cambiar a SweetAlert.
            if (!response.ok) throw new Error("Error al guardar cambios");

            // Actualizar los datos localmente
            await fetchOfertas();

            // Cerrar el modal
            handleCloseFicha();

            // Notificación de éxito. Temporal: Cambiar a SweetAlert.
            alert("Oferta actualizada correctamente");

        } catch (error) {

            // console.error(error); Habilitar solamente para pruebas
            console.error("Error al guardar cambios:", error);

            // Manejo de errores. Temporal: Cambiar a SweetAlert.
            alert("No fue posible guardar los cambios.");
        }
    };

    //----------------------------------------------------------------------------
    // Cancelar oferta.
    //----------------------------------------------------------------------------

    const handleCancelar = async (ofertaId) => {
        try {

            // Confirmación de usuario para cancelar la oferta: Temporal: Cambiar a SweetAlert.
            const confirmacion = confirm("¿Seguro que deseas cancelar esta oferta?");
            if (!confirmacion) return;

            // Buscar la oferta en el estado actual
            const oferta = ofertas.find((o) => o.ofertaId === ofertaId);
            if (!oferta) {

                // Manejo de error: Temporal: Cambiar a SweetAlert.
                alert("No se encontró la oferta en el estado actual.");
                return;
            }

            // Verificar si ya está cancelada
            if (oferta.estadoOfertaId === 5 || oferta.estado === "Cancelada") {
                alert("Esta oferta ya se encuentra cancelada.");
                return;
            }

            // Construir payload (Fomato JSON ) con validaciones
            const payload = {
                cursoId: matchCursoId(oferta.curso) || oferta.cursoId,
                sedeId: matchSedeId(oferta.sede) || oferta.sedeId,
                modalidadId: matchModalidadId(oferta.modalidad) || oferta.modalidadId,
                horarioId: matchHorarioId(oferta.horario, oferta.horarioId),
                periodoId: matchPeriodoId(oferta.periodo) || oferta.periodoId,
                accionId: matchAccionIdDesdeEstadoOAccion(oferta.estado, oferta.accion) || oferta.accionId,
                coordinadorId:
                    typeof oferta.coordinador === "object"
                        ? oferta.coordinador?.id ?? oferta.coordinadorId
                        : matchCoordinadorId(oferta.coordinador) || oferta.coordinadorId,
                comentarios: oferta.comentarios ?? "",
                estadoOfertaId: 5,
            };

            /*
            Para pruebas: Muestra en consola el payload que se enviará al backend

            console.group("Payload enviado al backend");
            console.table(payload);
            console.groupEnd();
            */

            // Llamada al endpoint para cancelar la oferta
            const response = await fetch(`/api/ofertas/${ofertaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // Manejo de errores
            if (!response.ok) {
                const msg = await response.text();
                console.error("Backend respondió error:", msg);
                throw new Error("Error al cancelar la oferta");
            }

            // Actualizar estado localmente
            setOfertas((prev) =>
                prev.map((o) =>
                    o.ofertaId === ofertaId
                        ? { ...o, estado: "Cancelada", estadoOfertaId: 5 }
                        : o
                )
            );

            // Notificación de éxito. Temporal: Cambiar a SweetAlert.
            alert("Oferta cancelada correctamente.");

        } catch (error) {
            // console.error("Error general:",error); Habilitar solamente para pruebas
            alert("No fue posible cancelar la oferta.");
        }
    };

    //----------------------------------------------------------------------------
    // Enviar oferta a docente
    //----------------------------------------------------------------------------

    const handleAbrirEnviar = (oferta) => {
        setOfertaSeleccionada(oferta);
        setDocenteId(oferta?.personaId ? String(oferta.personaId) : "");
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

    // Chips de colores:

    // Colores para Acciones
    const setAccionesColors = {
        "Abrir Curso": { color: "green", label: "ABRIR CURSO" },
        "Asignar Profesor": { color: "blue", label: "ASIGNAR PROFESOR" },
        "Nombrado": { color: "teal", label: "NOMBRADO" },
        "Cambiar Profesor": { color: "amber", label: "CAMBIAR PROFESOR" },
        "Cerrar Curso": { color: "red", label: "CERRAR CURSO" },
        "Reserva": { color: "purple", label: "RESERVA" },
        "Suficiencia": { color: "cyan", label: "SUFICIENCIA" },
        "Cerrado": { color: "gray", label: "CERRADO" },
    };

    // Función para renderizar
    const getAccionesColors = (accion) => {
        const conf = setAccionesColors[accion] || { color: "blue-gray", label: accion || "DESCONOCIDA" };
        return (
            <Chip
                value={conf.label}
                color={conf.color}
                className="font-bold text-white rounded-full px-3 py-1 text-xs w-fit"
            />
        );
    };

    // Colores y etiquetas para Estados
    const setEstadosColors = {
        "Pendiente": { color: "amber", label: "PENDIENTE" },
        "Enviada": { color: "blue", label: "ENVIADA" },
        "Aceptada": { color: "green", label: "ACEPTADA" },
        "Rechazada": { color: "red", label: "RECHAZADA" },
        "Cancelada": { color: "gray", label: "CANCELADA" },
    };

    // Función para renderizar 
    const getEstadoChip = (estado) => {
        const conf = setEstadosColors[estado] || { color: "blue-gray", label: estado || "DESCONOCIDO" };
        return (
            <Chip
                value={conf.label}
                color={conf.color}
                className="font-bold text-white rounded-full px-4 py-1 text-xs w-fit min-w-[90px] text-center"
            />
        );
    };

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
                    <Typography className="text-2xl font-extrabold text-[#2B338C]">Ofertas Presencial y En Línea</Typography>
                </div>

                <div className="flex items-center gap-2">

                    <Button
                        className="bg-[#FFDA00] text-[#2B338C] font-semibold flex items-center gap-2"
                        onClick={handleOpenNueva}
                    >
                        <PlusIcon className="h-5 w-5" /> Nueva oferta
                    </Button>



                </div>
            </div>

            {/* Filtros de busqueda */}
            <Card className="p-4 border border-gray-200 shadow-sm bg-white relative z-[50]">
                <div className="flex flex-wrap gap-3 items-end">

                    {/*Búsqueda general */}
                    <div className="flex-1 min-w-[250px]">
                        <Input
                            size="sm"
                            label="Buscar palabra clave"
                            icon={<MagnifyingGlassIcon className="h-5 w-5 text-[#2B338C]" />}
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>

                    {/*Curso */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="sm"
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
                            size="sm"
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
                            size="sm"
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
                            size="sm"
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

                    {/*Limpiar */}
                    <div className="flex-shrink-0 relative z-[50]">
                        <Button
                            variant="outlined"
                            onClick={limpiarFiltros}
                            className="border-[#2B338C] text-[#2B338C] text-sm flex items-center gap-2 hover:bg-[#2B338C]/10 transition-all"
                        >
                            <XCircleIcon className="h-4 w-4" />
                            Limpiar
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

                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-teal-600">
                    IMPORTADAS: {filtered.filter(o => o.estado === "Importada").length}
                </span>
            </div>

            {/* Tabla de Ofertas */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full text-left">
                        <thead className="bg-blue-gray-50 text-blue-gray-700">
                            <tr>
                                <th className="p-3">Curso</th>
                                <th className="p-3">Sede</th>
                                <th className="p-3">Modalidad</th>
                                <th className="p-3">Horario</th>
                                <th className="p-3">Periodo</th>
                                <th className="p-3">Coordinador</th>
                                <th className="p-3">Grupo</th>
                                <th className="p-3">Acciones</th>
                                <th className="p-3">Estado Oferta</th>
                                <th className="p-3">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((o) => (
                                <tr key={o.ofertaId} className="border-b">
                                    <td className="p-3">{o.curso}</td>
                                    <td className="p-3">{o.sede}</td>
                                    <td className="p-3">{o.modalidad}</td>
                                    <td className="p-3">{getHorarioNombre(o.horarioId)}</td> {/* este sí sigue siendo ID */}
                                    <td className="p-3">{o.periodo}</td>
                                    <td className="p-3">{getCoordinadorNombre(o.coordinadorId)} {getCoordinadorPrimerApellido(o.coordinadorId)} {getCoordinadorSegundoApellido(o.coordinadorId)}</td>
                                    <td className="p-3">{o.grupo}</td>
                                    <td className="p-3">{getAccionesColors(o.accion)}</td>
                                    <td className="p-3">{getEstadoChip(o.estado)}</td>
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
                                                <Button
                                                    size="sm" variant="outlined" className="border-green-600 text-green-700 p-2" onClick={() => handleAbrirEnviar(o)}
                                                >
                                                    <PaperAirplaneIcon className="h-4 w-4" />
                                                </Button>
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

            {/* Modal compartido: Funciones de Ver/Editar/Registar */}
            <Dialog
                open={openFicha}
                handler={handleCloseFicha}
                size="md"
                className="rounded-xl shadow-xl bg-white"
            >
                {/* Header */}
                <DialogHeader className="bg-[#2B338C] text-white font-semibold text-base px-6 py-3 rounded-t-xl flex items-center gap-2 shadow-md">
                    <span className="w-2.5 h-2.5 bg-[#FFDA00] rounded-full"></span>

                    {/* Título original */}
                    <span>
                        {modo === "nuevo"
                            ? "Registrar Nueva Oferta"
                            : modo === "editar"
                                ? "Editar Ficha de Oferta"
                                : `Ficha de Oferta ${fichaData?.curso
                                    ? `- ${fichaData.curso} - ${fichaData.sede} - ${fichaData.periodo}`
                                    : ""
                                }`}
                    </span>

                    {/* Grupo: se muestra siempre que exista en fichaData */}
                    {fichaData?.grupo != null && (
                        <span className="ml-2 text-white font-semibold text-base px-6 py-3 rounded-t-xl items-center gap-2 shadow-md">
                            Grupo {fichaData.grupo}
                        </span>
                    )}
                </DialogHeader>


                {/* Cuerpo */}
                <DialogBody className="p-6 bg-gray-50 border-x border-b border-gray-200">
                    {fichaLoading && (
                        <Typography className="text-blue-gray-600 text-center py-4">
                            Cargando información...
                        </Typography>
                    )}

                    {fichaError && (
                        <Typography className="text-red-600 text-center py-4">
                            {fichaError}
                        </Typography>
                    )}

                    {!fichaLoading && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-[15px] leading-tight">
                            {/* Sección: Datos de la Ficha */}
                            <h2 className="text-[#2B338C] font-bold text-base mb-2 border-b border-gray-300 pb-1">
                                Datos de la Ficha
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 mt-2">
                                {/* Curso */}
                                <Select
                                    label="Curso"
                                    value={fichaForm?.cursoId || ""}
                                    disabled={!editMode || OfertaCancelada}
                                    onChange={(v) => setFichaForm((prev) => ({ ...prev, cursoId: Number(v) }))}
                                >
                                    {cursos.map((c) => (
                                        <Option key={c.cursoId} value={c.cursoId}>
                                            {c.nombre}
                                        </Option>
                                    ))}
                                </Select>

                                {/* Sede */}
                                <Select
                                    label="Sede"
                                    value={fichaForm?.sedeId || ""}
                                    disabled={!editMode || OfertaCancelada}
                                    onChange={(v) =>
                                        setFichaForm((prev) => {
                                            const sedeId = Number(v);
                                            let modalidadId = prev.modalidadId;

                                            if (sedeId === 3) {
                                                modalidadId = 2; // Virtual
                                            } else if (sedeId === 1 || sedeId === 2) {
                                                modalidadId = 1; // Presencial
                                            }

                                            return {
                                                ...prev,
                                                sedeId,
                                                modalidadId,
                                            };
                                        })
                                    }
                                >
                                    {sedes.map((s) => (
                                        <Option key={s.sedeId} value={s.sedeId}>
                                            {s.nombre}
                                        </Option>
                                    ))}
                                </Select>

                                {/* Horario */}
                                <Select
                                    label="Horario"
                                    value={fichaForm?.horarioId || ""}
                                    disabled={!editMode || OfertaCancelada}
                                    onChange={(v) => setFichaForm((prev) => ({ ...prev, horarioId: Number(v) }))}
                                >
                                    {horario.map((h) => (
                                        <Option key={h.horarioId} value={h.horarioId}>
                                            {`${h.dia} - ${h.rango}`}
                                        </Option>
                                    ))}
                                </Select>

                                {/* Periodo */}
                                <Select
                                    label="Periodo"
                                    value={fichaForm?.periodoId || ""}
                                    disabled={!editMode || OfertaCancelada}
                                    onChange={(v) => setFichaForm((prev) => ({ ...prev, periodoId: Number(v) }))}
                                >
                                    {periodos.map((p) => (
                                        <Option key={p.periodoId} value={p.periodoId}>
                                            {`${p.numero}Q - ${p.anio}`}
                                        </Option>
                                    ))}
                                </Select>

                                {/* Coordinador */}
                                <Select
                                    label="Coordinador"
                                    value={fichaForm?.coordinadorId || ""}
                                    disabled={!editMode || OfertaCancelada}
                                    onChange={(v) => setFichaForm((prev) => ({ ...prev, coordinadorId: Number(v) }))}
                                >
                                    {coordinadores.map((c) => (
                                        <Option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </Option>
                                    ))}
                                </Select>
                            </div>

                            {/* Cupo y Matriculados */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 mt-4">
                                {/* Cupo */}
                                <div>
                                    <p className="text-[#2B338C] font-bold text-sm mb-1">Cupo</p>
                                    {editMode ? (
                                        <Input
                                            type="number"
                                            label="Cupo"
                                            value={fichaForm?.cupo ?? ""}
                                            disabled={OfertaCancelada}
                                            onChange={(e) =>
                                                setFichaForm((prev) => ({
                                                    ...prev,
                                                    cupo:
                                                        e.target.value === ""
                                                            ? null
                                                            : Number(e.target.value),
                                                }))
                                            }
                                        />
                                    ) : (
                                        <p className="text-gray-700 text-sm">
                                            {fichaData?.cupo ?? "No definido"}
                                        </p>
                                    )}
                                </div>

                                {/* Matriculados */}
                                <div>
                                    <p className="text-[#2B338C] font-bold text-sm mb-1">
                                        Estudiantes matriculados
                                    </p>
                                    {editMode ? (
                                        <Input
                                            type="number"
                                            label="Matriculados"
                                            value={fichaForm?.matriculados ?? ""}
                                            disabled={OfertaCancelada}
                                            onChange={(e) =>
                                                setFichaForm((prev) => ({
                                                    ...prev,
                                                    matriculados:
                                                        e.target.value === ""
                                                            ? null
                                                            : Number(e.target.value),
                                                }))
                                            }
                                        />
                                    ) : (
                                        <p className="text-gray-700 text-sm">
                                            {fichaData?.matriculados ?? "No definido"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Línea divisoria */}
                            <hr className="my-4 border-gray-300" />


                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 mt-2">
                                {!editMode ? (
                                    <>
                                        <div>
                                            <p className="text-[#2B338C] font-bold">Acción:</p>
                                            {getAccionesColors(fichaData?.accion)}
                                        </div>

                                        <div>
                                            <p className="text-[#2B338C] font-bold">Estado de la Oferta:</p>
                                            {getEstadoChip(fichaData?.estado)}
                                        </div>
                                    </>
                                ) : (
                                    <Select
                                        label="Acción"
                                        value={fichaForm?.accionId || ""}
                                        disabled={OfertaCancelada}
                                        onChange={(v) =>
                                            setFichaForm((prev) => ({ ...prev, accionId: Number(v) }))
                                        }
                                    >
                                        {estados.map((e) => (
                                            <Option key={e.accionId} value={e.accionId}>
                                                {e.nombre}
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            </div>

                            {/* Línea divisoria */}
                            <hr className="my-4 border-gray-300" />

                            {/* Sección: Comentarios */}
                            <h2 className="text-[#2B338C] font-bold text-base mb-2 border-b border-gray-300 pb-1">
                                Comentarios
                            </h2>

                            {!editMode ? (
                                <p className="text-gray-700 text-sm leading-relaxed border border-gray-100 rounded-md p-3 bg-gray-50">
                                    {fichaData?.comentarios || "No cuenta con comentarios."}
                                </p>
                            ) : (
                                <Input
                                    label="Comentarios"
                                    value={fichaForm?.comentarios ?? ""}
                                    disabled={OfertaCancelada}
                                    onChange={(e) =>
                                        setFichaForm((prev) => ({
                                            ...prev,
                                            comentarios: e.target.value,
                                        }))
                                    }
                                />
                            )}
                        </div>
                    )}
                </DialogBody>

                {/* Footer */}
                <DialogFooter className="bg-gray-50 border-t border-gray-200 px-5 py-3 rounded-b-xl flex justify-end">
                    {isNuevo ? (
                        <>
                            <Button
                                variant="outlined"
                                className="border-[#2B338C] text-[#2B338C] mr-2"
                                onClick={handleCloseFicha}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="bg-[#FFDA00] text-[#2B338C] font-semibold"
                                onClick={handleNuevaOferta}
                            >
                                Registrar
                            </Button>
                        </>
                    ) : editMode ? (
                        <>
                            <Button
                                variant="outlined"
                                className="border-[#2B338C] text-[#2B338C] mr-2"
                                onClick={handleCloseFicha}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="bg-[#FFDA00] text-[#2B338C] font-semibold"
                                onClick={handleSaveChanges}
                            >
                                Guardar
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="bg-[#FFDA00] text-[#2B338C] text-sm font-semibold px-6 py-2 rounded-md shadow-sm hover:shadow-md hover:bg-[#FFD700] transition-all"
                            onClick={handleCloseFicha}
                        >
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>

            </Dialog>

            {/* Modal: Enviar oferta a docente */}
            <Dialog
                open={openEnviar}
                handler={handleCerrarEnviar}
                size="sm"
                className="rounded-xl shadow-xl bg-white"
            >
                <DialogHeader className="bg-[#2B338C] text-white font-semibold text-base px-6 py-3 rounded-t-xl flex items-center gap-2 shadow-md">
                    <span className="w-2.5 h-2.5 bg-[#FFDA00] rounded-full"></span>
                    Enviar oferta a docente
                </DialogHeader>

                <DialogBody className="p-6 bg-gray-50 border-x border-b border-gray-200 space-y-4">
                    {!ofertaSeleccionada ? (
                        <Typography className="text-sm text-blue-gray-700">
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
                                <Typography className="text-[#2B338C] font-bold text-sm mb-2">
                                    Previsualización del correo
                                </Typography>
                                <pre className="whitespace-pre-wrap text-sm text-blue-gray-800 font-mono">
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

        </div >
    );
}