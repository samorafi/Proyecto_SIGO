import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Typography, Input, Select, Option, Button, Tooltip } from "@material-tailwind/react";
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

// Reutilizamos tus componentes
import PageTitle from "@/components/ui/Title/PageTitle";
import FichaOfertaModal from "./modals/FichaOfertaModal";

// Funciones reutilizadas
import { CatalogosNormalizados } from "@/hooks/CatalogosNormalizados";
import { OpenFichaOferta } from "@/pages/ofertas/functions";

import { useCatalogos } from "@/hooks/useCatalogos";

// Chips reutilizables
import { accionChips, estadoChips } from "@/pages/ofertas/Components/EstadosAccionesChips";

export default function OfertasHistorico() {

    // -------------------------------
    // Estados principales
    // -------------------------------
    const [ofertas, setOfertas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openFicha, setOpenFicha] = useState(false);
    const [fichaId, setFichaId] = useState(null);
    const [fichaData, setFichaData] = useState(null);
    const [fichaForm, setFichaForm] = useState(null);
    const [fichaLoading, setFichaLoading] = useState(false);
    const [fichaError, setFichaError] = useState("");

    // Cargar catálogos
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
        loading: loadingCatalogos
    } = useCatalogos();

    // Normalizadores reutilizados
    const normalizadores = CatalogosNormalizados({
        cursos,
        sedes,
        modalidades,
        horarios,
        periodos,
        coordinadores,
        estados,
    });

    const {
        getHorarioNombre,
        getDiaNombre,
        getHoraNombre,
        getCursoNombrePorCodigo,
        getCoordinadorNombre,
        getCoordinadorPrimerApellido,
        getCoordinadorSegundoApellido,
        matchCursoId,
        matchSedeId,
        matchModalidadId,
        matchPeriodoId,
        matchHorarioId,
        matchCoordinadorId,
        matchAccionIdDesdeEstadoOAccion
    } = normalizadores;

    // -------------------------------------------------------------------
    // Fetch Histórico
    // -------------------------------------------------------------------
    const fetchHistorico = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/ofertas");
            const data = await res.json();

            const archivados = (data || []).filter(o => o.archivados === true);

            setOfertas(archivados);

        } catch (err) {
            console.error("Error cargando histórico:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorico();
    }, []);

    // -------------------------------------------------------------------
    // Filtros
    // -------------------------------------------------------------------
    const [term, setTerm] = useState("");
    const [filterCurso, setFilterCurso] = useState("");
    const [filterSede, setFilterSede] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [filterTipoPeriodo, setFilterTipoPeriodo] = useState("");
    const [filterPeriodoId, setFilterPeriodoId] = useState("");
    const periodosFiltrados = useMemo(() => {
        if (!filterTipoPeriodo) return [];
        return periodos.filter(p => p.tipo === filterTipoPeriodo);
    }, [periodos, filterTipoPeriodo]);


    const filtered = useMemo(() => {
        return [...ofertas]
            .sort((a, b) => b.ofertaId - a.ofertaId)
            .filter(o => {

                if (filterCurso && o.curso !== filterCurso) return false;
                if (filterSede && o.sede !== filterSede) return false;
                if (filterEstado && o.estado !== filterEstado) return false;

                if (
                    filterTipoPeriodo &&
                    (!o.periodo || !o.periodo.includes(filterTipoPeriodo))
                ) {
                    return false;
                }

                const texto = `
                ${o.curso}
                ${o.sede}
                ${o.modalidad}
                ${o.periodo}
                ${o.accion}
                ${o.estado}
            `.toLowerCase();

                if (term && !texto.includes(term.toLowerCase())) {
                    return false;
                }

                return true;
            });
    }, [
        ofertas,
        term,
        filterCurso,
        filterSede,
        filterEstado,
        filterTipoPeriodo
    ]);


    // -------------------------------------------------------------------
    // Paginación
    // -------------------------------------------------------------------
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    const currentData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    // -------------------------------------------------------------------
    // Abrir Ficha (solo ver)
    // -------------------------------------------------------------------
    const handleOpenFicha = async (id) => {
        setFichaId(id);
        setOpenFicha(true);
        setFichaLoading(true);
        setFichaError("");

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

    const handleCloseFicha = () => {
        setOpenFicha(false);
        setFichaData(null);
        setFichaForm(null);
    };





    // -------------------------------------------------------------------
    // Render principal
    // -------------------------------------------------------------------
    if (loading || loadingCatalogos) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-blue-gray-600">
                <svg className="animate-spin h-6 w-6 text-[#2B338C]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                </svg>
                <Typography>Cargando histórico...</Typography>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">

            <PageTitle>Histórico de Ofertas Archivadas</PageTitle>

            {/* Filtros */}
            <Card className="p-4 border border-gray-200 shadow-md bg-white relative z-[50]">
                <div className="flex flex-wrap gap-3 items-end">

                    {/* Buscar */}
                    <div className="flex-1 min-w-[250px]">
                        <Input
                            size="md"
                            label="Buscar palabra clave"
                            icon={<MagnifyingGlassIcon className="h-5 w-5 text-[#2B338C]" />}
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>

                    {/* Tipo de período */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="md"
                            label="Tipo de período"
                            value={filterTipoPeriodo}
                            onChange={(v) => {
                                const tipo = v || "";
                                setFilterTipoPeriodo(tipo);
                                setFilterPeriodoId("");
                            }}
                            selected={() =>
                                filterTipoPeriodo
                                    ? filterTipoPeriodo === "C"
                                        ? "Cuatrimestre"
                                        : filterTipoPeriodo === "T"
                                            ? "Trimestre"
                                            : "Periodo"
                                    : "Todos"
                            }
                            menuProps={{
                                className:
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)]",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todos</Option>
                            <Option value="C">Cuatrimestre</Option>
                            <Option value="T">Trimestre</Option>
                            <Option value="P">Periodo</Option>
                        </Select>
                    </div>

                    {/* Período */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            label="Periodo"
                            value={filterPeriodoId}
                            disabled={!filterTipoPeriodo}
                            onChange={(v) => setFilterPeriodoId(v || "")}
                        >
                            <Option value="">Todos</Option>
                            {periodosFiltrados.map(p => (
                                <Option key={p.periodoId} value={String(p.periodoId)}>
                                    {`${p.numero}${p.tipo} - ${p.anio}`}
                                </Option>
                            ))}
                        </Select>

                    </div>


                    {/* Curso */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="md"
                            label="Curso"
                            value={filterCurso}
                            onChange={(v) => setFilterCurso(v || "")}
                            selected={() => (filterCurso ? filterCurso : "Todos")}
                            menuProps={{
                                className:
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todos</Option>
                            {Array.from(new Set(ofertas.map(o => o.curso))).map(c => (
                                <Option key={c} value={c} className="bg-white">
                                    {c}
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
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todas</Option>
                            {Array.from(new Set(ofertas.map(o => o.sede))).map(s => (
                                <Option key={s} value={s} className="bg-white">
                                    {s}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Estado */}
                    <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                        <Select
                            size="md"
                            label="Estado"
                            value={filterEstado}
                            onChange={(v) => setFilterEstado(v || "")}
                            selected={() => (filterEstado ? filterEstado : "Todos")}
                            menuProps={{
                                className:
                                    "z-[100] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto",
                                placement: "bottom-start",
                            }}
                            containerProps={{ className: "relative z-[70]" }}
                        >
                            <Option value="">Todos</Option>
                            {Array.from(new Set(ofertas.map(o => o.estado))).map(es => (
                                <Option key={es} value={es} className="bg-white">
                                    {es}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Refrescar */}
                    <div className="flex-shrink-0">
                        <Button
                            variant="outlined"
                            onClick={fetchHistorico}
                            className="border-green-600 text-green-700 flex items-center gap-2"
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                            Refrescar
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tabla */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-left">
                        <thead className="bg-blue-gray-50">
                            <tr>
                                <th className="p-3">Sede</th>
                                <th className="p-3">Código</th>
                                <th className="p-3">Nombre</th>
                                <th className="p-3">Día</th>
                                <th className="p-3">Horario</th>
                                <th className="p-3">Periodo</th>
                                <th className="p-3">Coordinador</th>
                                <th className="p-3">Acción</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3">Ver</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((o) => (
                                <tr key={o.ofertaId} className="border-b">
                                    <td className="p-3">{o.sede}</td>
                                    <td className="p-3">{o.curso}</td>
                                    <td className="p-3">{getCursoNombrePorCodigo(o.curso)}</td>
                                    <td className="p-3">{getDiaNombre(o.horarioId)}</td>
                                    <td className="p-3">{getHoraNombre(o.horarioId)}</td>
                                    <td className="p-3">{o.periodo}</td>
                                    <td className="p-3">{getCoordinadorNombre(o.coordinadorId)} {getCoordinadorPrimerApellido(o.coordinadorId)}</td>
                                    <td className="p-3">{accionChips(o.accion)}</td>
                                    <td className="p-3">{estadoChips(o.estado)}</td>
                                    <td className="p-3">
                                        <Tooltip content="Ver Ficha">
                                            <Button
                                                size="sm"
                                                variant="outlined"
                                                className="border-[#2B338C] text-[#2B338C]"
                                                onClick={() => handleOpenFicha(o.ofertaId)}
                                            >
                                                Ver
                                            </Button>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* PAGINACIÓN */}
                    <div className="flex items-center justify-between p-3">
                        <span className="text-sm">
                            Mostrando {currentData.length} de {total}
                        </span>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outlined"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>

                            <span>Página {page} de {totalPages}</span>

                            <Button
                                variant="outlined"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* MODAL REUTILIZADO */}
            <FichaOfertaModal
                open={openFicha}
                onClose={handleCloseFicha}
                modo="ver"
                isNuevo={false}
                editMode={false}
                OfertaCancelada={true}

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

                setFichaForm={setFichaForm}

                accionChips={accionChips}
                estadoChips={estadoChips}
            />
        </div>
    );
}
