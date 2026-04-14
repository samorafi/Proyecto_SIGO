// /pages/ofertas/functions/GuardarOferta.js
import { apiFetch } from "@/services/apiClientService";

export default async function GuardarOferta(ofertaId, payload) {
    try {
        const isNew = ofertaId == null;

        const url = isNew
            ? "/api/ofertas"
            : `/api/ofertas/${ofertaId}`;

        const method = isNew ? "POST" : "PUT";

        const res = await apiFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const msg = await res.text();
            return { ok: false, error: msg || "No se pudo guardar la oferta." };
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        return { ok: true, data };

    } catch (err) {
        console.error("Error GuardarOferta:", err);
        return { ok: false, error: "Error interno al guardar la oferta." };
    }
}
