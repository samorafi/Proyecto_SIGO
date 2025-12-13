import { Card, Input, Select, Option, Button } from "@material-tailwind/react";
import { MagnifyingGlassIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function OfertaFilters({
    term,
    setTerm,

    filterCurso,
    setFilterCurso,

    filterSede,
    setFilterSede,

    filterEstado,
    setFilterEstado,

    filterCoordinador,
    setFilterCoordinador,

    rowsPerPage,
    setRowsPerPage,
    setPage,

    limpiarFiltros,
    fetchOfertas,

    ofertas,
    coordinadores,
}) {
    return (
        <Card className="p-4 border border-gray-200 shadow-md bg-white relative z-[50]">
            <div className="flex flex-wrap gap-3 items-end">

                {/* BUSCAR */}
                <div className="flex-1 min-w-[250px]">
                    <Input
                        size="md"
                        label="Buscar palabra clave"
                        icon={<MagnifyingGlassIcon className="h-5 w-5 text-[#2B338C]" />}
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                </div>

                {/* CURSO */}
                <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                    <Select
                        size="md"
                        label="Curso"
                        value={filterCurso}
                        onChange={(v) => setFilterCurso(v || "")}
                        selected={() => (filterCurso ? filterCurso : "Todos")}
                    >
                        <Option value="">Todos</Option>
                        {Array.from(new Set(ofertas.map(o => o.curso))).map((curso) => (
                            <Option key={curso} value={curso}>{curso}</Option>
                        ))}
                    </Select>
                </div>

                {/* SEDE */}
                <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                    <Select
                        size="md"
                        label="Sede"
                        value={filterSede}
                        onChange={(v) => setFilterSede(v || "")}
                        selected={() => (filterSede ? filterSede : "Todas")}
                    >
                        <Option value="">Todas</Option>
                        {Array.from(new Set(ofertas.map(o => o.sede))).map((sede) => (
                            <Option key={sede} value={sede}>{sede}</Option>
                        ))}
                    </Select>
                </div>

                {/* ESTADO */}
                <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                    <Select
                        size="md"
                        label="Estado"
                        value={filterEstado}
                        onChange={(v) => setFilterEstado(v || "")}
                        selected={() => (filterEstado ? filterEstado : "Todos")}
                    >
                        <Option value="">Todos</Option>
                        {Array.from(new Set(ofertas.map(o => o.estado))).map((estado) => (
                            <Option key={estado} value={estado}>{estado}</Option>
                        ))}
                    </Select>
                </div>

                {/* COORDINADOR */}
                <div className="min-w-[220px] flex-shrink-0 relative z-[60]">
                    <Select
                        size="md"
                        label="Coordinador"
                        value={filterCoordinador}
                        onChange={(v) => setFilterCoordinador(v || "")}
                        selected={() =>
                            filterCoordinador
                                ? coordinadores.find((c) => c.id === Number(filterCoordinador))?.nombre
                                : "Todos"
                        }
                    >
                        <Option value="">Todos</Option>
                        {coordinadores.map((c) => (
                            <Option key={c.id} value={String(c.id)}>
                                {c.nombre}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* FILAS */}
                <div className="min-w-[120px] flex-shrink-0">
                    <Select
                        size="md"
                        label="Filas"
                        value={String(rowsPerPage)}
                        onChange={(v) => {
                            setRowsPerPage(Number(v || 10));
                            setPage(1);
                        }}
                    >
                        <Option value="10">10</Option>
                        <Option value="20">20</Option>
                        <Option value="50">50</Option>
                    </Select>
                </div>

                {/* REFRESCAR */}
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

                {/* LIMPIAR */}
                <div className="flex-shrink-0">
                    <Button
                        variant="outlined"
                        onClick={limpiarFiltros}
                        className="border-[#2B338C] text-[#2B338C] flex items-center gap-2"
                    >
                        <XCircleIcon className="h-4 w-4" />
                        Limpiar
                    </Button>
                </div>
            </div>
        </Card>
    );
}
