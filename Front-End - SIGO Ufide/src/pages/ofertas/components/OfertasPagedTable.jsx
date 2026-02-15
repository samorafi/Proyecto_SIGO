import { useMemo, useState, useEffect } from "react";
import { Card, Typography, Select, Option, Button, Tooltip, Input } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

// Componente: UI
import PageTitle from "@/components/ui/Title/PageTitle";
import { FormButton, ArchiveButton, DuplicateButton, ViewButton, EditButton, CancelButton, SendButton, ClearFiltersButton, RefreshButton } from "@/components/ui/Buttons";
import AppPagination from "@/components/ui/pagination/AppPagination";

// Componente: Resumen de estados de oferta (chips de colores)
import ResumenEstadosChips from "./ResumenEstadosChips";
import { accionChips, estadoChips } from "./EstadosAccionesChips";

// Hooks para cargar catálogos y periodos
import { usePeriodos } from "@/hooks/usePeriodos";
import { usePeriodosApi } from "@/hooks/usePeriodosApi";

// Importación de hooks  propias de ofertas
import { useOfertasPaged,useOfertasSummary,useArchivarOfertas_v2,useDuplicarOfertasV2 } from "../hooks";

// Importación de modales propias de ofertas
import {ModalArchivarOfertas_v2,ModalDuplicarOfertas} from "../modals";

export default function OfertasPagedTable({ category, title = "Ofertas" }) {

  // Filtros de búsqueda
  const [filters, setFilters] = useState({
    buscar: "",
    sedeId: "",
    modalidadId: "",
    tipoPeriodo: "",
    periodoId: "",
    dia: "",
    horarioId: "",
    accionId: "",
    estadoOfertaId: "",
  });

  // Cargar datos paginados de ofertas según categoría y filtros
  const {
    items,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    loading,
    error,
    totalCount,
    refresh,
    allowedPageSizes,
  } = useOfertasPaged({ category, initialPageSize: 10, filters });

  // Función para actualizar un filtro específico y resetear a página 1
  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Columnas de la tabla (Memorizadas para no recrearlas en cada render)
  const columns = useMemo(() => [
    { accessorKey: "sede", header: "Sede" },
    { accessorKey: "cursoid", header: "Código Curso" },
    { accessorKey: "curso", header: "Nombre Curso" },
    { accessorKey: "grupo", header: "Grupo" },
    { accessorKey: "horarioDia", header: "Día" },
    { accessorKey: "horarioHora", header: "Horario" },
    { accessorKey: "periodo", header: "Periodo" },
    { accessorKey: "coordinador", header: "Coordinador" },
    { accessorKey: "modalidad", header: "Modalidad" },
    {
      accessorKey: "accion",
      header: "Acciones",
      cell: ({ getValue }) => accionChips(getValue()),
    },
    {
      accessorKey: "estado",
      header: "Estado Oferta",
      cell: ({ getValue }) => estadoChips(getValue()),
    },
    {
      id: "opciones",
      header: "Opciones",
      cell: ({ row }) => {
        const o = row.original;

        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Ver detalle">
              <ViewButton />
            </Tooltip>

            <Tooltip content="Editar oferta">
              <EditButton />
            </Tooltip>

            <Tooltip content="Cancelar oferta">
              <CancelButton />
            </Tooltip>

            <Tooltip content="Enviar a docente">
              <SendButton />
            </Tooltip>
          </div>
        );
      },
    }
    ,
  ], []);

  // Configuración de la tabla con React Table
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // Resumen de estados de las ofertas.
  const {
    data: summary,
    loading: loadingSummary,
    error: summaryError,
    refresh: refreshSummary,
  } = useOfertasSummary(category);

  // Función para la selección del titulo.
  const TITLE_BY_CATEGORY = {
    1: "Ofertas Presencial Y En Línea",
    2: "Ofertas 100% Virtual",
    3: "Histórico de Ofertas",
  };

  // Título dinámico según la categoría seleccionada.
  const OfertaTitle = TITLE_BY_CATEGORY[category] ?? "Ofertas";

  // Componente helper para mostrar información en modo mobile (tarjeta) de forma más visual.
  const InfoMini = ({ label, value }) => (
    <div className="rounded-xl border border-blue-gray-100 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold text-blue-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-blue-gray-900 break-words">
        {value}
      </div>
    </div>
  );

  // Hook para filtrado de periodos
  // Filtrado de periodos
  const { periodos, loading: loadingPeriodos } = usePeriodosApi();
  const { periodosOrdenados } = usePeriodos(periodos, filters.tipoPeriodo);

  // Filtado de Sedes
  const SEDES = [
    { id: 1, nombre: "Sede Heredia" },
    { id: 2, nombre: "Sede San Pedro" },
    { id: 3, nombre: "Campus Virtual" },
  ];

  // Filtrado de sedes: Solo aplica para el historico y presencial/linea
  const showSede = category !== 2;
  useEffect(() => {
    if (!showSede && filters.sedeId) {
      setFilters(prev => ({ ...prev, sedeId: "" }));
      setPage(1);
    }
  }, [showSede, filters.sedeId, setPage]);

  // Filtado de modalidad: Solo aplica para el historico y presencial/linea
  const MODALIDADES = [
    { id: 1, nombre: "Presencial" },
    { id: 2, nombre: "Virtual" },
    { id: 3, nombre: "En Línea" },
  ];

  // Se separa la opción de modalidad en linea en Presencial y En Línea para el filtro
  const modalidadesFiltradas = useMemo(() => {
    if (category === 1) {
      // Presencial y Virtual
      return MODALIDADES.filter(m => m.id !== 3);
    }

    if (category === 3) {
      // Histórico: Todos
      return MODALIDADES;
    }

    // category === 2 no muestra select
    return [];
  }, [category]);

  useEffect(() => {
    if (category === 1 && filters.modalidadId === "3") {
      setFilters(prev => ({ ...prev, modalidadId: "" }));
      setPage(1);
    }

    if (category === 2 && filters.modalidadId) {
      setFilters(prev => ({ ...prev, modalidadId: "" }));
      setPage(1);
    }
  }, [category, filters.modalidadId, setPage]);

  // Filtrado de acciones de oferta
  const ACCIONES = [
    { id: 1, nombre: "Abrir Curso" },
    { id: 2, nombre: "Asignar Profesor" },
    { id: 3, nombre: "Nombrado" },
    { id: 4, nombre: "Cambiar Profesor" },
    { id: 5, nombre: "Cerrar Curso" },
    { id: 6, nombre: "Reserva" },
    { id: 7, nombre: "Suficiencia" },
    { id: 8, nombre: "Cerrado" },
  ];

  const accionLabel = useMemo(() => {
    if (!filters.accionId) return "Todos";
    const a = ACCIONES.find(x => String(x.id) === String(filters.accionId));
    return a?.nombre ?? "Todos";
  }, [filters.accionId, ACCIONES]);

  // Filtrado de estados de oferta
  const ESTADOS = [
    { id: 1, nombre: "Enviada" },
    { id: 2, nombre: "Pendiente" },
    { id: 3, nombre: "Aceptada" },
    { id: 4, nombre: "Rechazada" },
    { id: 5, nombre: "Cancelada" },
    { id: 6, nombre: "Importada" },
  ];

  const estadoLabel = useMemo(() => {
    if (!filters.estadoOfertaId) return "Todos";
    const e = ESTADOS.find(x => String(x.id) === String(filters.estadoOfertaId));
    return e?.nombre ?? "Todos";
  }, [filters.estadoOfertaId, ESTADOS]);

  // Props seguros para los Select (evitan errores al deshabilitar opciones)
  const menuPropsSafe = {
    className:
      "z-[99999] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)]",
    placement: "bottom-start",
  };

  // Archivar Ofertas
  const {
    openModal: openArchivarModal,
    setOpenModal: setOpenArchivarModal,
    abrirModal: abrirArchivarModal,

    tipoPeriodo: tipoPeriodoArchivar,
    setTipoPeriodo: setTipoPeriodoArchivar,

    selectedPeriodo: selectedPeriodoArchivar,
    setSelectedPeriodo: setSelectedPeriodoArchivar,

    catHistorico: isHistoricoArchivar,
    catRequiereModalidad,
    bloquearModalidad,

    modalidadesParaSelect,
    selectedModalidad: selectedModalidadArchivar,
    setSelectedModalidad: setSelectedModalidadArchivar,

    periodosDisponibles,
    avisoArchivar,
    archivar,
    loadingArchivar,
    mensajeArchivar,
  } = useArchivarOfertas_v2(periodos, refresh, category);

  const containerPropsSafe = { className: "min-w-0" };

  // Duplicar Ofertas
  const {
    openModal: openDuplicarModal,
    setOpenModal: setOpenDuplicarModal,
    abrirModalDuplicar: abrirDuplicarModal,

    tipoPeriodo: tipoPeriodoDuplicar,
    setTipoPeriodo: setTipoPeriodoDuplicar,

    periodoOrigen,
    setPeriodoOrigen,
    periodoDestino,
    setPeriodoDestino,

    selectedModalidad: selectedModalidadDuplicar,
    setSelectedModalidad: setSelectedModalidadDuplicar,

    periodosOrigenFiltrados,
    periodosDestinoFiltrados,
    duplicar,
    loadingDuplicar,
    avisoCanceladas,

    catHistorico: isHistoricoDuplicar,
    catRequiereModalidad: catRequiereModalidadDuplicar,
    modalidadesPermitidas: modalidadesPermitidasDuplicar,
    bloquearModalidad: bloquearModalidadDuplicar,
  } = useDuplicarOfertasV2(periodos, refresh, category);

  return (
    <>
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        {/* Título: Centrado en móvil, a la izquierda en escritorio */}
        <div className="text-center sm:text-left">
          <PageTitle>{OfertaTitle}</PageTitle>
        </div>

        {/* Contenedor de Botones: Wrap para que bajen si no caben, y scroll horizontal si es necesario */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">

          {/* Botón Nueva Oferta: Opcional hacerlo full width en móvil con 'w-full sm:w-auto' */}
          <FormButton className="w-full sm:w-auto">Nueva oferta</FormButton>

          {!isHistoricoArchivar && (
            <ArchiveButton
              onClick={abrirArchivarModal}
              className="w-full sm:w-auto"
            >
              Archivar Ofertas
            </ArchiveButton>
          )}

          {!isHistoricoDuplicar && (
            <DuplicateButton
              onClick={abrirDuplicarModal}
              className="w-full sm:w-auto"
            >
              Duplicar ofertas
            </DuplicateButton>
          )}
        </div>
      </div>

      {/* Card de filtros */}
      <Card className="p-4 mb-3 rounded-2xl shadow-sm">

        {/* Grid de filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">

          {/* Buscar */}
          <div className="lg:col-span-2">
            <Input
              label="Buscar (curso, código, coordinador)"
              value={filters.buscar}
              onChange={(e) => setFilter("buscar", e.target.value)}
            />
          </div>

          {/* Tipo de período */}
          <div className="relative">
            <Select
              label="Tipo de período"
              value={filters.tipoPeriodo}
              onChange={(v) => {
                const tipo = v || "";
                setFilters((prev) => ({ ...prev, tipoPeriodo: tipo, periodoId: "" }));
                setPage(1);
              }}
              selected={() =>
                filters.tipoPeriodo
                  ? filters.tipoPeriodo === "C"
                    ? "Cuatrimestre"
                    : filters.tipoPeriodo === "T"
                      ? "Trimestre"
                      : "Periodo"
                  : "Todos"
              }
              containerProps={containerPropsSafe}
              menuProps={menuPropsSafe}
            >
              <Option value="">Todos</Option>
              <Option value="C">Cuatrimestre</Option>
              <Option value="T">Trimestre</Option>
              <Option value="P">Periodo</Option>
            </Select>
          </div>

          {/* Período */}
          <div className="relative">
            <Select
              label="Periodo"
              value={filters.periodoId}
              disabled={!filters.tipoPeriodo}
              onChange={(v) => {
                setFilters((prev) => ({ ...prev, periodoId: v || "" }));
                setPage(1);
              }}
              selected={() => {
                if (!filters.periodoId) return "Todos";
                const p = periodos.find(x => String(x.periodoId) === String(filters.periodoId));
                return p ? `${p.numero}${p.tipo} - ${p.anio}` : "Periodo";
              }}
              containerProps={containerPropsSafe}
              menuProps={menuPropsSafe}
            >
              <Option value="">Todos</Option>
              {periodosOrdenados.map((p) => (
                <Option key={p.periodoId} value={String(p.periodoId)}>
                  {`${p.numero}${p.tipo} - ${p.anio}`}
                </Option>
              ))}
            </Select>
          </div>

          {/* Sede */}
          {category !== 2 && (
            <div className="relative">
              <Select
                label="Sede"
                value={filters.sedeId}
                onChange={(v) => setFilter("sedeId", v || "")}
                selected={(el) => el?.props?.children ?? "Todos"}
                className="text-sm"
                containerProps={{ className: "min-w-0" }}
              >
                <Option value="">Todos</Option>
                {SEDES.map((s) => (
                  <Option key={s.id} value={String(s.id)}>
                    {s.nombre}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Modalidad */}
          {category !== 2 && (
            <div className="relative">
              <Select
                label="Modalidad"
                value={filters.modalidadId}
                onChange={(v) => setFilter("modalidadId", v || "")}
                selected={(el) => el?.props?.children ?? "Todos"}
                className="text-sm"
                containerProps={{ className: "min-w-0" }}
              >
                <Option value="">Todos</Option>
                {modalidadesFiltradas.map((m) => (
                  <Option key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Acción */}
          <div className="relative">
            <Select
              label="Acción"
              value={String(filters.accionId || "")}
              onChange={(v) => setFilter("accionId", v || "")}
              selected={() => accionLabel}
              containerProps={containerPropsSafe}
              menuProps={menuPropsSafe}
            >
              <Option value="">Todas</Option>
              {ACCIONES.map(a => (
                <Option key={a.id} value={String(a.id)}>
                  {a.nombre}
                </Option>
              ))}
            </Select>
          </div>

          {/* Estado */}
          <div className="relative">
            <Select
              label="Estado"
              value={String(filters.estadoOfertaId || "")}
              onChange={(v) => setFilter("estadoOfertaId", v || "")}
              selected={() => estadoLabel}
              className="text-sm"
              containerProps={{ className: "min-w-0" }}
            >
              <Option value="">Todos</Option>
              {ESTADOS.map((e) => (
                <Option key={e.id} value={String(e.id)}>
                  {e.nombre}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Acciones + Mostrar cantidad registros */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Mostrar */}
          <div className="w-full sm:w-auto">
            <div className="w-full sm:w-28">
              <Select
                label="Mostrar"
                value={String(pageSize)}
                onChange={(v) => setPageSize(Number(v))}
                className="text-sm"
                containerProps={{ className: "min-w-0" }}
              >
                {allowedPageSizes.map((n) => (
                  <Option key={n} value={String(n)}>
                    {n}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:justify-end">
            <ClearFiltersButton
              variant="outlined"
              className="w-full sm:w-auto"
              onClick={() => {
                setFilters({
                  buscar: "",
                  sedeId: "",
                  modalidadId: "",
                  tipoPeriodo: "",
                  periodoId: "",
                  dia: "",
                  horarioId: "",
                  accionId: "",
                  estadoOfertaId: "",
                });
                setPage(1);
                refresh();
              }}
            >
              Limpiar
            </ClearFiltersButton>

            <RefreshButton
              variant="outlined"
              className="w-full sm:w-auto"
              onClick={refresh}
              disabled={loading}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refrescar
            </RefreshButton>
          </div>
        </div>
      </Card>

      {/* Errores + Chips */}
      {error ? <div className="p-3 text-red-600">{error}</div> : null}

      {summaryError ? (
        <div className="p-2 text-red-600 text-sm">No se pudo cargar el resumen.</div>
      ) : null}

      <ResumenEstadosChips data={summary} />

      {/* Tabla */}
      <Card className="overflow-hidden">

        {/* Modo: Mobile */}
        <div className="md:hidden p-3 space-y-3">
          {loading ? (
            <div className="p-3">Cargando...</div>
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="p-3 text-blue-gray-500">Sin resultados</div>
          ) : (
            table.getRowModel().rows.map((row) => {
              const cell = (id) =>
                row.getVisibleCells().find((c) => c.column.id === id);

              const V = (id) => {
                const c = cell(id);
                return c ? flexRender(c.column.columnDef.cell, c.getContext()) : "—";
              };

              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-blue-gray-100 bg-white shadow-sm overflow-hidden"
                >
                  <div className="p-4 border-b border-blue-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-blue-gray-500">
                          {V("sede")}
                        </div>

                        <div className="mt-1 text-base font-bold text-blue-gray-900 leading-snug break-words">
                          {V("curso")}
                        </div>

                        <div className="mt-1 text-sm text-blue-gray-600">
                          {V("cursoid")}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <div>{V("estado")}</div>

                        <div className="px-3 py-1 rounded-full text-xs font-semibold border border-blue-gray-100 bg-blue-gray-50 text-blue-gray-700">
                          {V("modalidad")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">{V("accion")}</div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoMini label="Grupo" value={V("grupo")} />
                      <InfoMini label="Día" value={V("horarioDia")} />
                      <InfoMini label="Horario" value={V("horarioHora")} />
                      <InfoMini label="Período" value={V("periodo")} />
                    </div>

                    <div className="mt-3 pt-3 border-t border-blue-gray-50">
                      <div className="text-xs font-semibold text-blue-gray-500">
                        Coordinador
                      </div>
                      <div className="mt-1 text-sm text-blue-gray-900 break-words">
                        {V("coordinador")}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-blue-gray-50/40 border-t border-blue-gray-50">
                    <div className="flex items-center justify-end">
                      {V("opciones")}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="pt-2">
            <AppPagination
              page={page}
              setPage={setPage}
              rowsPerPage={pageSize}
              total={totalPages}
            />
          </div>
        </div>

        {/* Modo: Escritorio */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead className="bg-blue-gray-50 text-blue-gray-700">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="p-3">
                      <Typography variant="small" className="font-bold">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </Typography>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading ? (
                <tr className="border-b">
                  <td colSpan={columns.length} className="p-3">
                    Cargando...
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <AppPagination
            page={page}
            setPage={setPage}
            rowsPerPage={pageSize}
            total={totalCount}
          />
        </div>
      </Card>

      {/* Modal para archivar ofertas */}
      <ModalArchivarOfertas_v2
        open={openArchivarModal}
        onClose={() => setOpenArchivarModal(false)}
        tipoPeriodo={tipoPeriodoArchivar}
        setTipoPeriodo={setTipoPeriodoArchivar}
        selectedPeriodo={selectedPeriodoArchivar}
        setSelectedPeriodo={setSelectedPeriodoArchivar}
        selectedModalidad={selectedModalidadArchivar}
        setSelectedModalidad={setSelectedModalidadArchivar}
        infoArchivar={avisoArchivar}
        catRequiereModalidad={catRequiereModalidad}
        bloquearModalidad={bloquearModalidad}
        catHistorico={isHistoricoArchivar}
        modalidades={modalidadesParaSelect}
        periodosDisponibles={periodosDisponibles}
        loadingArchivar={loadingArchivar}
        mensajeArchivar
        onArchivar={archivar}
        onArchived={refresh}
      />

      {/* Modal para duplicar ofertas */}
      <ModalDuplicarOfertas
        open={openDuplicarModal}
        onClose={() => setOpenDuplicarModal(false)}
        mostrarModalidad={catRequiereModalidadDuplicar}
        bloquearModalidad={bloquearModalidadDuplicar}
        modalidadesPermitidas={modalidadesPermitidasDuplicar}
        infoCanceladas={avisoCanceladas}
        tipoPeriodo={tipoPeriodoDuplicar}
        setTipoPeriodo={setTipoPeriodoDuplicar}
        periodoOrigen={periodoOrigen}
        setPeriodoOrigen={setPeriodoOrigen}
        periodoDestino={periodoDestino}
        setPeriodoDestino={setPeriodoDestino}
        selectedModalidad={selectedModalidadDuplicar}
        setSelectedModalidad={setSelectedModalidadDuplicar}
        periodosOrigenFiltrados={periodosOrigenFiltrados}
        periodosDestinoFiltrados={periodosDestinoFiltrados}
        loadingDuplicar={loadingDuplicar}
        onDuplicar={duplicar}
      />
    </>
  );

}
