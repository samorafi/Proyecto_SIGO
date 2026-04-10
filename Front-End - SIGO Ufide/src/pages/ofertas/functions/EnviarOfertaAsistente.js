import { apiFetch } from "@/services/apiClientService";

export default async function EnviarOfertaAsistente(payload) {
  try {
    const ofertaId = Number(payload?.ofertaId);
    const personaId = Number(payload?.personaId);
    const evaluacionPeriodoId =
      payload?.evaluacionPeriodoId == null || payload?.evaluacionPeriodoId === ""
        ? null
        : Number(payload.evaluacionPeriodoId);

    if (!ofertaId) {
      return { ok: false, error: "Oferta inválida." };
    }

    if (!personaId) {
      return { ok: false, error: "Asistente inválido." };
    }

    const res = await apiFetch("/api/OfertaAsistenteSolicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ofertaId,
        personaId,
        evaluacionPeriodoId,
      }),
    });

    if (!res.ok) {
      let backendMsg = "";
      try {
        const errData = await res.json();
        backendMsg =
          errData?.message ||
          errData?.title ||
          errData?.error ||
          (errData?.errors ? Object.values(errData.errors).flat().join(" | ") : "");
      } catch (_) {}

      return {
        ok: false,
        error: backendMsg || "No se pudo enviar la oferta al asistente.",
      };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    console.error("Error en EnviarOfertaAsistente:", error);
    return {
      ok: false,
      error: "Error inesperado al enviar la oferta al asistente.",
    };
  }
}