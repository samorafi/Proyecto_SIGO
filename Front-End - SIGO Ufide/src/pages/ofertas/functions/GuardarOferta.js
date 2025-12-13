// /pages/ofertas/functions/GuardarOferta.js

export default async function GuardarOferta(ofertaId, payload) {
    try {
        const isNew = ofertaId == null; // null o undefined = nueva oferta

        const url = isNew
            ? "/api/ofertas"
            : `/api/ofertas/${ofertaId}`;

        const method = isNew ? "POST" : "PUT";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const msg = await res.text();
            return { ok: false, error: msg || "No se pudo guardar la oferta." };
        }

        const data = await res.json();

        return { ok: true, data };

    } catch (err) {
        console.error("Error GuardarOferta:", err);
        return { ok: false, error: "Error interno al guardar la oferta." };
    }
}
