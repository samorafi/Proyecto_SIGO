// /pages/ofertas/functions/OpenFichaOferta.js
import { normalizarOferta } from "./normalizarOferta";

export default async function OpenFichaOferta(id, helpers) {
    try {
        // 1. Llamar al backend
        const res = await fetch(`/api/ofertas/${id}`);
        if (!res.ok) {
            return { ok: false, error: "No se pudo cargar la oferta." };
        }

        const data = await res.json();

        // 2. EXTRAER tipo de periodo (C / T / P)
        let tipoExtraido = "";
        if (typeof data.periodo === "string") {
            const match = data.periodo.match(/[CTP]/i);
            if (match) tipoExtraido = match[0].toUpperCase();
        }

        // 3. Preparar helpers + tipoPeriodo detectado
        const helpersConTipo = {
            ...helpers,
            tipoExtraido,
        };

        // 4. Normalizar la oferta COMPLETA
        const fichaForm = normalizarOferta(
            {
                ...data,
                tipoPeriodo: data.tipo || data.tipoPeriodo || tipoExtraido || "",
            },
            helpersConTipo
        );

        // 5. Retornar todo listo
        return {
            ok: true,
            data, 
            fichaForm,
        };

    } catch (error) {
        console.error("Error en OpenFichaOferta:", error);
        return { ok: false, error: "Error inesperado al abrir la oferta." };
    }
}
