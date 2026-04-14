// src/pages/ofertas/hooks/useOfertasFilters.js
import { useCallback, useState } from "react";

export function useOfertasFilters(initial = {}) {
    const [term, setTerm] = useState(initial.term ?? "");
    const [filterCurso, setFilterCurso] = useState(initial.filterCurso ?? "");
    const [filterSede, setFilterSede] = useState(initial.filterSede ?? "");
    const [filterEstado, setFilterEstado] = useState(initial.filterEstado ?? "");
    const [filterCoordinador, setFilterCoordinador] = useState("");


    const limpiarFiltros = () => {
        setTerm("");
        setFilterCurso("");
        setFilterSede("");
        setFilterEstado("");
        setFilterCoordinador("");
    };

    return {
        term, setTerm,
        filterCurso, setFilterCurso,
        filterSede, setFilterSede,
        filterEstado, setFilterEstado,
        filterCoordinador, setFilterCoordinador,
        limpiarFiltros,
    };
}
