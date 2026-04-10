import { apiFetch } from "@/services/apiClientService";

export default async function QuitarAsistenteOferta(ofertaId, personaId) {
  try {
    if (!ofertaId) return { ok: false, error: "Oferta inválida." };
    if (!personaId) return { ok: false, error: "Asistente inválido." };

    const res = await apiFetch(`/api/Ofertas/${ofertaId}/asistentes/${personaId}`, {
      method: "DELETE",
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
        error: backendMsg || "No se pudo quitar el asistente.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error en QuitarAsistenteOferta:", error);
    return { ok: false, error: "Error inesperado al quitar el asistente." };
  }
}