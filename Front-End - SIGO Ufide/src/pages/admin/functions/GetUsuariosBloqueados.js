// src/pages/usuarios/functions/GetUsuariosBloqueados.js
import { apiFetch } from "@/services/apiClientService";

export default async function GetUsuariosBloqueados() {
  try {
    const res = await apiFetch("/api/Autenticacion/bloqueados");

    if (!res.ok) {
      return {
        ok: false,
        error: "No se pudieron cargar los usuarios bloqueados.",
      };
    }

    const data = await res.json();

    return {
      ok: true,
      data: data ?? [],
    };
  } catch (error) {
    console.error("Error en GetUsuariosBloqueados:", error);

    return {
      ok: false,
      error: "Error inesperado al cargar los usuarios bloqueados.",
    };
  }
}