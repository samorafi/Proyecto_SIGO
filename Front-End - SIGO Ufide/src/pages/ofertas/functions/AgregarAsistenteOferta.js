import { apiFetch } from "@/services/apiClientService";

export default async function AgregarAsistenteOferta(ofertaId, personaId) {
  try {
    if (!ofertaId) return { ok: false, error: "Oferta inválida." };
    if (!personaId) return { ok: false, error: "Debe seleccionar un asistente." };

    const res = await apiFetch(`/api/Ofertas/${ofertaId}/asistentes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ofertaId: Number(ofertaId),
        personaId: Number(personaId),
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
        error: backendMsg || "No se pudo agregar el asistente.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error en AgregarAsistenteOferta:", error);
    return { ok: false, error: "Error inesperado al agregar el asistente." };
  }
}