/*
  Archivo: modalArchivarOfertas.jsx

  Descripción: Modal para archivar ofertas, con selección de periodo y modalidad según categoría.

  Reglas de negocio:
  - Histórico (3) no se archiva.
  - Si es Presencial/Virtual (1), el usuario debe elegir si archiva modalidad Presencial (1) o Virtual (2).
  - Si es En Línea (2), la modalidad se fija a En Línea (3) y no se pregunta.
  - El periodo seleccionado se archiva según la modalidad indicada.
  - El procedimiento almacenado garantiza que solo se archiven las ofertas correspondientes a la modalidad y periodo.

  Clases relacionadas:
  - Backend: SIGO.Application.Features.Ofertas.Commands.Archivar;
  - Base de datos: Procedimiento almacenado -  universidad.archivar_ofertas_por_periodo_y_modalidad
  - Frontend:
            - Componente Hook: useArchivarOfertas.js
            - Componente tabla: OfertasPagedTable.jsx (botón que abre el modal)

*/

// Importar componentes de UI
import { Select, Option, Button, Typography } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";

// Importar servicios de SweetAlert personalizados
import { alertService } from "@/services/alert.service";
import { entityConfirm } from "@/services/entityConfirm.service";

// Propiedades del modal
export default function ModalArchivarOfertas_v2({

  // Control de apertura y cierre de Modal
  open,
  onClose,
  onArchived,

  // flags provenientes del hook
  catHistorico = false,
  catRequiereModalidad = false,
  bloquearModalidad = false,

  // Mensaje de usuario
  infoArchivar,

  // Selección de Peridodo
  tipoPeriodo,
  setTipoPeriodo,
  selectedPeriodo,
  setSelectedPeriodo,
  periodosDisponibles = [],

  // Selección de Modalidad
  selectedModalidad,
  setSelectedModalidad,
  modalidades = [],

  // Acciones y estados para el proceso de archivado
  loadingArchivar,
  onArchivar,

  // Mensajes y etiquetas
  entityLabel = "las ofertas",
  successMessage = "Ofertas archivadas correctamente",
  title = "Archivar ofertas",
}) {

  // Determinamos si se debe renderizar el select de modalidad
  const mostrarModalidad = Boolean(catRequiereModalidad);

  // Manejador del botón principal
  const handleArchivarClick = async () => {
    if (catHistorico) return;

    // Usamos el servicio de confirmación configurado
    const confirmFn = entityConfirm.archive ?? entityConfirm.create;

    const ok = await confirmFn(entityLabel, {
      title: "¿Archivar ofertas?",
      text: "Las ofertas del período seleccionado se moverán a Histórico.",
      confirmButtonText: "Sí, archivar",
    });

    if (!ok) return;

    try {
      alertService.loading("Archivando...", "Aplicando cambios");

      // Ejecutamos la función 'archivar' del hook
      const result = await onArchivar?.();

      alertService.close();

      if (result && result.ok === false) {
        alertService.error("No se pudo archivar", result.error || "Intenta nuevamente.");
        return;
      }

      // Extraemos el mensaje de éxito del API
      const apiMsg =
        result?.mensaje ||
        result?.message ||
        (typeof result === "string" ? result : null);

      if (apiMsg) alertService.success("Archivado completado", apiMsg);
      else alertService.toastSuccess(successMessage);

      onClose?.();
      onArchived?.(result);
    } catch (err) {
      alertService.close();
      alertService.apiError(err, "No se pudieron archivar los registros");
    }
  };

  // Validación para deshabilitar el botón de acción
  const disabledBtn =
    loadingArchivar ||
    !selectedPeriodo ||
    (mostrarModalidad && !selectedModalidad);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            variant="outlined"
            className="w-full sm:w-auto !border-[#2B338C] !text-[#2B338C]"
            onClick={onClose}
            disabled={loadingArchivar}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleArchivarClick}
            disabled={disabledBtn}
            className="w-full sm:w-auto !bg-[#FFDA00] !text-[#2B338C] font-semibold px-6 py-2 rounded-md shadow-none"
          >
            {loadingArchivar ? "Archivando..." : "Archivar"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Sección de Modalidad */}
        {mostrarModalidad && (
          <div className="sm:col-span-2">
            <Select
              key={`sel-mod-arch-${modalidades.length}`}
              label="Modalidad"
              value={selectedModalidad ? String(selectedModalidad) : ""}
              onChange={(v) => setSelectedModalidad(v || "")}
              disabled={bloquearModalidad || loadingArchivar}
              containerProps={{ className: "min-w-0" }}
            >
              {modalidades.length === 0 ? (
                <Option disabled>No hay modalidades disponibles</Option>
              ) : (
                modalidades.map((m) => (
                  <Option key={String(m.id)} value={String(m.id)}>
                    {m.nombre}
                  </Option>
                ))
              )}
            </Select>
          </div>
        )}

        {/* Tipo de periodo (C, T, P) */}
        <div className="sm:col-span-2">
          <Select
            label="Tipo de periodo"
            value={tipoPeriodo}
            onChange={(v) => setTipoPeriodo(v || "C")}
            disabled={loadingArchivar}
            containerProps={{ className: "min-w-0" }}
          >
            <Option value="C">Cuatrimestre (C)</Option>
            <Option value="T">Trimestre (T)</Option>
            <Option value="P">Periodo (P)</Option>
          </Select>
        </div>

        {/* Selección del Periodo específico a archivar */}
        <div className="sm:col-span-2 min-w-0">
          <Select
            key={`sel-per-arch-${tipoPeriodo}-${periodosDisponibles.length}`}
            label="Período a archivar"
            value={selectedPeriodo ? String(selectedPeriodo) : ""}
            onChange={(v) => setSelectedPeriodo(v || "")}
            disabled={loadingArchivar || periodosDisponibles.length === 0}
            containerProps={{ className: "min-w-0" }}
          >
            {periodosDisponibles.length === 0 ? (
              <Option disabled>No hay periodos disponibles</Option>
            ) : (
              periodosDisponibles.map((p) => (
                <Option key={p.periodoId} value={String(p.periodoId)}>
                  {p.etiqueta}
                </Option>
              ))
            )}
          </Select>
        </div>

        {/* Banner informativo: Informativo */}
        {infoArchivar && (
          <div className="sm:col-span-2 mb-2">
            <div className="flex gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 shadow-sm">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-blue-900">
                  Información importante
                </Typography>
                <Typography variant="small" className="text-blue-800 leading-relaxed">
                  {infoArchivar.replace('Importante: ', '').replace('Importarte: ', '')}
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
}