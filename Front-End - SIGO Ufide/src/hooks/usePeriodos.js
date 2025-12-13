import { useMemo } from "react";

export function usePeriodos(periodos, tipoPeriodo) {

    // ---------------------------------------------------------
    // Cálculo del periodo actual
    // ---------------------------------------------------------
    const getCurrentPeriodo = (tipo) => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        if (tipo === "C") {
            if (month <= 4) return { numero: 1, year };
            if (month <= 8) return { numero: 2, year };
            return { numero: 3, year };
        }

        if (tipo === "T") {
            if (month <= 3) return { numero: 1, year };
            if (month <= 6) return { numero: 2, year };
            if (month <= 9) return { numero: 3, year };
            return { numero: 4, year };
        }

        if (tipo === "P") {
            return { numero: month, year };
        }

        return null;
    };

    const current = useMemo(
        () => getCurrentPeriodo(tipoPeriodo),
        [tipoPeriodo]
    );

    // ---------------------------------------------------------
    // FILTROS
    // ---------------------------------------------------------

    // Periodos ≤ actual
    const periodosPasados = useMemo(() => {
        if (!periodos || !current) return [];

        const { numero, year } = current;

        return periodos
            .filter((p) => p.tipo === tipoPeriodo)
            .filter((p) =>
                p.anio < year || (p.anio === year && p.numero <= numero)
            )
            .sort((a, b) =>
                b.anio !== a.anio ? b.anio - a.anio : b.numero - a.numero
            );
    }, [periodos, current, tipoPeriodo]);

    // Periodos > actual
    const periodosFuturos = useMemo(() => {
        if (!periodos || !current) return [];

        const { numero, year } = current;

        return periodos
            .filter((p) => p.tipo === tipoPeriodo)
            .filter((p) =>
                p.anio > year || (p.anio === year && p.numero > numero)
            )
            .sort((a, b) =>
                a.anio !== b.anio ? a.anio - b.anio : a.numero - b.numero
            );
    }, [periodos, current, tipoPeriodo]);

    // Todos ordenados descendente
    const periodosOrdenados = useMemo(() => {
        if (!periodos) return [];

        return [...periodos]
            .filter((p) => p.tipo === tipoPeriodo)
            .sort((a, b) => {
                if (a.anio !== b.anio) return b.anio - a.anio;
                return b.numero - a.numero;
            });
    }, [periodos, tipoPeriodo]);

    return {
        currentPeriodo: current,

        periodosPasados,
        periodosFuturos,
        periodosOrdenados,

        getCurrentPeriodo,
    };
}
