// src/pages/usuarios/functions/DesbloquearUsuarios.js
import { apiFetch } from "@/services/apiClientService";

export default async function DesbloquearUsuarios(usuarioIds = []) {
  try {
    const res = await apiFetch("/api/Autenticacion/desbloquear", {
      method: "POST",
      body: JSON.stringify({ usuarioIds }),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: "No se pudieron desbloquear los usuarios.",
      };
    }

    const data = await res.json();

    return {
      ok: true,
      data,
      mensaje: data?.mensaje ?? "Se han desbloqueado correctamente los usuarios.",
    };
  } catch (error) {
    console.error("Error en DesbloquearUsuarios:", error);

    return {
      ok: false,
      error: "Error inesperado al desbloquear los usuarios.",
    };
  }
}