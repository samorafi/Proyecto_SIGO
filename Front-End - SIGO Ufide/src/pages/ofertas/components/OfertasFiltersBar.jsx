// src/pages/ofertas/components/OfertasFiltersBar.jsx
import { Card, Input, Select, Option } from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ClearFiltersButton, RefreshButton } from "@/components/ui/Buttons";

export default function OfertasFiltersBar({
    ofertas = [],
    coordinadores = [],
    getCursoNombrePorCodigo,

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

    onClear,
    onRefresh,
}) {
    const cursos = Array.from(new Set(ofertas.map((o) => o.curso))).filter(Boolean);
    const sedes = Array.from(new Set(ofertas.map((o) => o.sede))).filter(Boolean);
    const estados = Array.from(new Set(ofertas.map((o) => o.estado))).filter(Boolean);

    return (
        <Card className="p-4 border border-gray-200 shadow-md bg-white relative z-[50]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                {/* Fila 1: grandes */}
                <div className="col-span-12 md:col-span-4">
                    <Input
                        size="md"
                        label="Buscar palabra clave"
                        icon={<MagnifyingGlassIcon className="h-5 w-5 text-[#2B338C]" />}
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                </div>

                <div className="col-span-12 md:col-span-4 relative z-[90]">
                    <Select
                        size="md"
                        label="Curso"
                        value={filterCurso}
                        onChange={(v) => setFilterCurso(v || "")}
                        selected={() => {
                            if (!filterCurso) return "Todos";
                            const nombre = getCursoNombrePorCodigo?.(filterCurso);
                            return nombre ? `${filterCurso} - ${nombre}` : filterCurso;
                        }}
                        menuProps={{
                            className:
                                "z-[999] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)] max-h-80 overflow-auto min-w-[220px]",
                            placement: "bottom-start",
                        }}
                        containerProps={{ className: "relative z-[95]" }}
                    >
                        <Option value="">Todos</Option>
                        {cursos.map((curso) => (
                            <Option key={curso} value={curso} className="bg-white">
                                {curso}
                                {getCursoNombrePorCodigo ? ` - ${getCursoNombrePorCodigo(curso)}` : ""}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div className="col-span-12 md:col-span-4 relative z-[60]">
                    <Select
                        size="md"
                        label="Coordinador"
                        value={filterCoordinador}
                        onChange={(v) => setFilterCoordinador(v || "")}
                        selected={() => {
                            if (!filterCoordinador) return "Todos";

                            const c = coordinadores.find(
                                (x) => String(x.id) === String(filterCoordinador)
                            );

                            return c ? `${c.nombre} ${c.primerApellido} ${c.segundoApellido}` : "Todos";
                        }}
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
                                {c.nombre} {c.primerApellido} {c.segundoApellido}
                            </Option>
                        ))}
                    </Select>

                </div>

                <div className="col-span-12 md:col-span-3 relative z-[60]">
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
                        {sedes.map((sede) => (
                            <Option key={sede} value={sede} className="bg-white">
                                {sede}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div className="col-span-12 md:col-span-3 relative z-[60]">
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
                        {estados.map((estado) => (
                            <Option key={estado} value={estado} className="bg-white">
                                {estado}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div className="col-span-6 md:col-span-2">
                    <Select
                        size="md"
                        label="Filas"
                        value={String(rowsPerPage)}
                        onChange={(v) => {
                            setRowsPerPage(Number(v || 10));
                            setPage?.(1);
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

                <div className="col-span-6 md:col-span-4 flex gap-2 justify-end">
                    <ClearFiltersButton onClick={onClear} />
                    <RefreshButton onClick={onRefresh} />
                </div>

            </div>
        </Card>

    );
}
