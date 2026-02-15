import { Select, Option, Button, Typography } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";
import { alertService } from "@/services/alert.service";
import { entityConfirm } from "@/services/entityConfirm.service";
import { getNombreModalidad } from "../constants/OfertaCategory";

export default function ModalDuplicarOfertas_v2({
  open,
  onClose,
  onDuplicated,

  // UI flags / info
  mostrarModalidad = false,
  bloquearModalidad = false,
  modalidadesPermitidas = [],

  // Mensaje de usuario
  infoCanceladas,

  // form states
  tipoPeriodo,
  setTipoPeriodo,

  periodoOrigen,
  setPeriodoOrigen,
  periodoDestino,
  setPeriodoDestino,

  selectedModalidad,
  setSelectedModalidad,

  // lists
  periodosOrigenFiltrados = [],
  periodosDestinoFiltrados = [],
  modalidades = [],

  // action/state
  loadingDuplicar,
  onDuplicar,

  entityLabel = "las ofertas",
  successMessage = "Ofertas duplicadas correctamente",
  title = "Duplicar ofertas",
}) {

  const modalidadesFiltradas = (modalidades || []).filter((m) => {
    const id = Number(m.modalidadId ?? m.id ?? m.modalidad_id);
    if (!id) return false;

    if (Array.isArray(modalidadesPermitidas) && modalidadesPermitidas.length > 0) {
      return modalidadesPermitidas.map(Number).includes(id);
    }

    return true;
  });

  const modalidadesFinales =
    (modalidadesFiltradas.length > 0
      ? modalidadesFiltradas.map((m) => {
        const id = m.modalidadId ?? m.id ?? m.modalidad_id;
        const nombre = m.nombre ?? m.name ?? m.descripcion;
        return { id: String(id), nombre };
      })
      : (modalidadesPermitidas || []).map((id) => ({
        id: String(id),
        nombre: getNombreModalidad(id),
      })));

  const handleDuplicarClick = async () => {
    const ok = await entityConfirm.create(entityLabel, {
      title: "¿Duplicar ofertas?",
      text: "Las ofertas del período origen se duplicarán al período destino.",
      confirmButtonText: "Sí, duplicar",
    });
    if (!ok) return;

    try {
      alertService.loading("Duplicando...", "Aplicando cambios");

      const result = await onDuplicar?.();

      alertService.close();

      if (result && result.ok === false) {
        alertService.error("No se pudo duplicar", result.error || "Intenta nuevamente.");
        return;
      }

      const apiMsg =
        result?.mensaje ||
        result?.message ||
        (typeof result === "string" ? result : null);

      if (apiMsg) alertService.success("Duplicación completada", apiMsg);
      else alertService.toastSuccess(successMessage);

      onClose?.();
      onDuplicated?.(result);
    } catch (err) {
      alertService.close();
      alertService.apiError(err, "No se pudieron duplicar los registros");
    }
  };

  const disabledBtn =
    loadingDuplicar ||
    !periodoOrigen ||
    !periodoDestino ||
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
            className="w-full sm:w-auto border-[#2B338C] text-[#2B338C]"
            onClick={onClose}
            disabled={loadingDuplicar}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleDuplicarClick}
            disabled={disabledBtn}
            className="w-full sm:w-auto bg-[#FFDA00] text-[#2B338C] font-semibold px-6 py-2 rounded-md shadow-none"
          >
            {loadingDuplicar ? "Duplicando..." : "Duplicar"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Modalidad (solo Presencial/Virtual) */}
        {mostrarModalidad && (
          <div className="sm:col-span-2">
            <Select
              // La key obliga al componente a reconstruirse si cambian las modalidades
              key={`select-mod-${modalidadesFinales.length}-${bloquearModalidad}`}
              label="Modalidad"
              value={selectedModalidad ? String(selectedModalidad) : ""}
              onChange={(v) => {
                setSelectedModalidad(v || "");
              }}
              disabled={bloquearModalidad || loadingDuplicar}
              containerProps={{ className: "min-w-0" }}
            >
              {modalidadesFinales.length === 0 ? (
                <Option disabled>No hay modalidades</Option>
              ) : (
                modalidadesFinales.map((m) => (
                  <Option key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </Option>
                ))
              )}
            </Select>
          </div>
        )}

        {/* Tipo periodo */}
        <div className="sm:col-span-2">
          <Select
            label="Tipo de periodo"
            value={tipoPeriodo}
            onChange={(v) => setTipoPeriodo(v || "C")}
            disabled={loadingDuplicar}
            containerProps={{ className: "min-w-0" }}
          >
            <Option value="C">Cuatrimestre (C)</Option>
            <Option value="T">Trimestre (T)</Option>
            <Option value="P">Periodo (P)</Option>
          </Select>
        </div>

        {/* Periodo Origen */}
        <div className="min-w-0">
          <Select
            key={`origen-${tipoPeriodo}-${periodosOrigenFiltrados.map(p => p.periodoId).join(",")}`}
            label="Periodo Origen"
            value={periodoOrigen}
            onChange={(v) => setPeriodoOrigen(v || "")}
            disabled={loadingDuplicar || periodosOrigenFiltrados.length === 0}
            containerProps={{ className: "min-w-0" }}
          >
            {periodosOrigenFiltrados.length === 0 ? (
              <Option disabled>No hay periodos disponibles</Option>
            ) : (
              periodosOrigenFiltrados.map((p) => (
                <Option key={p.periodoId} value={String(p.periodoId)}>
                  {p.etiqueta}
                </Option>
              ))
            )}
          </Select>
        </div>

        {/* Periodo Destino */}
        <div className="min-w-0">
          <Select
            key={`destino-${tipoPeriodo}-${periodosDestinoFiltrados.map(p => p.periodoId).join(",")}`}
            label="Periodo Destino"
            value={periodoDestino}
            onChange={(v) => setPeriodoDestino(v || "")}
            disabled={loadingDuplicar || periodosDestinoFiltrados.length === 0}
            containerProps={{ className: "min-w-0" }}
          >
            {periodosDestinoFiltrados.length === 0 ? (
              <Option disabled>No hay periodos disponibles</Option>
            ) : (
              periodosDestinoFiltrados.map((p) => (
                <Option
                  key={p.periodoId}
                  value={String(p.periodoId)}
                  disabled={String(p.periodoId) === String(periodoOrigen)}
                >
                  {p.etiqueta}
                </Option>
              ))
            )}
          </Select>
        </div>

        {/* Banner informativo: Warning */}
        {infoCanceladas && (
          <div className="sm:col-span-2 mb-2">
            <div className="flex gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 shadow-sm">
              {/* Icono de Advertencia (Warning) */}
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-amber-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div>
                <Typography variant="small" className="font-bold text-amber-900">
                  Aviso sobre ofertas canceladas
                </Typography>
                <Typography variant="small" className="text-amber-800 leading-relaxed">
                  {infoCanceladas.replace('Importarte: ', '').replace('Importante: ', '')}
                </Typography>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppModal>
  );

}
