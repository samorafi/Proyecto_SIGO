/*
  Archivo: useCancelarOferta_v2.js

  Descripción: Hook para cancelar una oferta, con confirmación y manejo de estados.

  Regla de negocio: 
  
  - Al cancelar una oferta, se muestra una confirmación al usuario. Si el usuario confirma, 
    se realiza la cancelación de la oferta. Se maneja el estado de cancelación para mostrar indicadores de carga 
    y se muestran mensajes de éxito o error según corresponda.

  - Se puede editar unicamente los comentarios.

  Backend: 
          - SIGO.Application.Features.Ofertas.Commands.Cancelar.CancelarOfertaCommand
          - SIGO.Application.Features.Ofertas.Commands.Cancelar.CancelarOfertaCommandHandler

  Frontend:
          - Componente Tabla: OfertasPagedTable.jsx

*/

import { useCallback, useState } from "react";

// Importar SweetAlert
import { alertService } from "@/services/alert.service";


export function useCancelarOferta_v2({
  
  // Mensajes personalizables
  onAfterCancel, 
  confirmTitle = "¿Cancelar oferta?",
  confirmText = "La oferta quedará cancelada y no podrá usarse.",
  confirmButtonText = "Sí, cancelar",
  successText = "Oferta cancelada correctamente",
} = {}) {
  const [cancelandoId, setCancelandoId] = useState(null);

  // Función para cancelar la oferta
  const cancelar = useCallback(

    async (ofertaId) => {

      // Validar ID de oferta
      const id = ofertaId ?? "";
      if (!id) {
        alertService.error("Error", "ID de oferta inválido.");
        return { ok: false };
      }

      // Mostrar confirmación al usuario
      const confirmar = await alertService.confirm({
        title: confirmTitle,
        text: confirmText,
        confirmText: confirmButtonText,
      });

      // Si el usuario no confirma, salir sin hacer nada
      if (!confirmar) return { ok: false, cancelled: false };

      try {
        setCancelandoId(id);

        // Llamada al endpoint
        const res = await fetch(`/api/ofertas/${id}/cancelar`, {
          method: "POST",
        });

        // Almacenar respuesta del endpoint
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const txt = await res.text().catch(() => "");
          const msg =
            data?.message ||
            data?.error ||
            txt ||
            "No fue posible cancelar la oferta.";

          alertService.error("No se pudo cancelar", msg);
          return { ok: false };
        }

        alertService.toastSuccess(successText);

        if (onAfterCancel) await onAfterCancel();

        return { ok: true, cancelled: true };
      } catch (e) {
        console.error(e);
        alertService.error("Error", "Error desconocido al cancelar la oferta.");
        return { ok: false };
      } finally {
        setCancelandoId(null);
      }
    },
    [
      confirmTitle,
      confirmText,
      confirmButtonText,
      successText,
      onAfterCancel,
    ]
  );

  return { cancelar, cancelandoId };
}
