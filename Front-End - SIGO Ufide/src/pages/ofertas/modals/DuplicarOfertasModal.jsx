import { Select, Option, Button } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";
import { useEffect, useMemo } from "react";
import { alertService } from "@/services/alert.service";
import { entityConfirm } from "@/services/entityConfirm.service";

export default function DuplicarOfertasModal({
  open,
  onClose,

  modalidad,
  setModalidad,
  tipoPeriodo,
  setTipoPeriodo,
  periodoOrigen,
  setPeriodoOrigen,
  periodoDestino,
  setPeriodoDestino,

  periodosOrigenFiltrados = [],
  periodosDestinoFiltrados = [],

  // ✅ NUEVO: catálogo + filtros
  modalidades = [],
  modalidadesPermitidas,
  modalidadesExcluidas,
  bloquearModalidad = false,

  loading,
  mensaje,
  onDuplicar,
}) {
  // filtrar modalidades según pantalla
  const modalidadesFiltradas = useMemo(() => {
    return (modalidades || []).filter((m) => {
      const id = m.modalidadId ?? m.id ?? m.modalidad_id;

      if (Array.isArray(modalidadesPermitidas) && modalidadesPermitidas.length > 0) {
        return modalidadesPermitidas.includes(Number(id));
      }
      if (Array.isArray(modalidadesExcluidas) && modalidadesExcluidas.length > 0) {
        return !modalidadesExcluidas.includes(Number(id));
      }
      return true;
    });
  }, [modalidades, modalidadesPermitidas, modalidadesExcluidas]);

  // si solo queda 1 opción, autoselecciona
  useEffect(() => {
    if (!open) return;

    if (!modalidad && modalidadesFiltradas.length === 1) {
      const only = modalidadesFiltradas[0];
      const id = only.modalidadId ?? only.id ?? only.modalidad_id;
      setModalidad(String(id));
    }
  }, [open, modalidad, modalidadesFiltradas, setModalidad]);

  const handleDuplicarClick = async () => {
    const ok = await entityConfirm.create("las ofertas", {
      title: "¿Duplicar ofertas?",
      text: "Las ofertas del período seleccionado se duplicarán al nuevo período.",
      confirmText: "Sí, duplicar",
    });
    if (!ok) return;

    try {
      alertService.loading("Duplicando ofertas...", "Procesando información");

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
      else alertService.toastSuccess("Ofertas duplicadas correctamente");

      onClose?.();
    } catch (err) {
      alertService.close();
      alertService.apiError(err, "No se pudieron duplicar las ofertas");
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Duplicar ofertas por periodo"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="outlined"
            className="border-[#2B338C] text-[#2B338C]"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            disabled={!periodoOrigen || !periodoDestino || !modalidad || loading}
            className="bg-[#FFDA00] text-[#2B338C] font-semibold"
            onClick={handleDuplicarClick}
          >
            {loading ? "Duplicando..." : "Duplicar"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Modalidad (dinámica y filtrada) */}
        <Select
          label="Modalidad"
          value={modalidad || undefined}
          onChange={(v) => setModalidad(v || "")}
          disabled={bloquearModalidad || loading}
        >
          {modalidadesFiltradas.length === 0 ? (
            <Option disabled>No hay modalidades</Option>
          ) : (
            modalidadesFiltradas.map((m) => {
              const id = m.modalidadId ?? m.id ?? m.modalidad_id;
              const nombre = m.nombre ?? m.name ?? m.descripcion;
              return (
                <Option key={id} value={String(id)}>
                  {nombre}
                </Option>
              );
            })
          )}
        </Select>

        {/* Tipo de periodo */}
        <Select label="Tipo de periodo" value={tipoPeriodo} onChange={setTipoPeriodo}>
          <Option value="C">Cuatrimestre (C)</Option>
          <Option value="T">Trimestre (T)</Option>
          <Option value="P">Periodo (P)</Option>
        </Select>

        {/* Periodo Origen */}
        <Select
          label="Periodo origen"
          value={periodoOrigen || undefined}
          onChange={(v) => setPeriodoOrigen(v || "")}
        >
          {periodosOrigenFiltrados.map((p) => (
            <Option key={p.periodoId} value={String(p.periodoId)}>
              {p.etiqueta}
            </Option>
          ))}
        </Select>

        {/* Periodo Destino */}
        <Select
          label="Periodo destino"
          value={periodoDestino || undefined}
          onChange={(v) => setPeriodoDestino(v || "")}
        >
          {periodosDestinoFiltrados.map((p) => (
            <Option key={p.periodoId} value={String(p.periodoId)}>
              {p.etiqueta}
            </Option>
          ))}
        </Select>

        {/* Si querés mostrar mensaje */}
        {/* {mensaje && (
          <div className="p-3 text-blue-800 bg-blue-50 border border-blue-200 rounded text-sm">
            {mensaje}
          </div>
        )} */}
      </div>
    </AppModal>
  );
}
