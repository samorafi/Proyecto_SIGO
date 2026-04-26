// src/pages/usuarios/hooks/useUsuariosBloqueados.js

import { useCallback, useState } from "react";
import { useAlert } from "@/hooks/useAlert";

import GetUsuariosBloqueados from "../functions/GetUsuariosBloqueados";
import DesbloquearUsuarios from "../functions/DesbloquearUsuarios";

export function useUsuariosBloqueados() {
  const alert = useAlert();

  const [usuariosBloqueados, setUsuariosBloqueados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const cargarUsuariosBloqueados = useCallback(async () => {
    setLoading(true);

    const result = await GetUsuariosBloqueados();

    if (!result.ok) {
      setUsuariosBloqueados([]);
      await alert.error("Error", result.error);
      setLoading(false);
      return [];
    }

    setUsuariosBloqueados(result.data);
    setLoading(false);
    return result.data;
  }, [alert]);

  const desbloquearUsuarios = useCallback(
    async (usuarioIds = []) => {
      if (!usuarioIds.length) {
        await alert.warning("Atención", "Seleccioná al menos un usuario.");
        return null;
      }

      const confirmado = await alert.confirm({
        title: "¿Desbloquear usuarios?",
        text: `Se desbloquearán ${usuarioIds.length} usuario(s).`,
        confirmText: "Sí, desbloquear",
        cancelText: "Cancelar",
        icon: "warning",
      });

      if (!confirmado) return null;

      setUnlocking(true);
      alert.loading("Desbloqueando...", "Aplicando cambios.");

      const result = await DesbloquearUsuarios(usuarioIds);

      alert.close();

      if (!result.ok) {
        await alert.error("Error", result.error);
        setUnlocking(false);
        return null;
      }

      await alert.success("Listo", result.mensaje);

      await cargarUsuariosBloqueados();

      setUnlocking(false);
      return result.data;
    },
    [alert, cargarUsuariosBloqueados]
  );

  return {
    usuariosBloqueados,
    loading,
    unlocking,
    cargarUsuariosBloqueados,
    desbloquearUsuarios,
    setUsuariosBloqueados,
  };
}