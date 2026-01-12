import { alertService } from "@/services/alert.service";

const normalizeEntity = (entity = "registro") => {
  const e = String(entity).trim();
  return e ? e : "registro";
};

export const entityConfirm = {
  async update(entity, opts = {}) {
    const e = normalizeEntity(entity);

    return alertService.confirm({
      title: `¿Actualizar ${e}?`,
      text: `Se actualizará ${e} con los cambios realizados. ¿Deseas continuar?`,
      confirmText: "Sí, actualizar",
      cancelText: "Cancelar",
      icon: "info",
      ...opts,
    });
  },

  async create(entity, opts = {}) {
    const e = normalizeEntity(entity);

    return alertService.confirm({
      title: `¿Crear ${e}?`,
      text: `Se registrará ${e} con la información ingresada. ¿Deseas continuar?`,
      confirmText: "Sí, crear",
      cancelText: "Cancelar",
      icon: "info",
      ...opts,
    });
  },

  async cancel(entity, opts = {}) {
    const e = normalizeEntity(entity);

    return alertService.confirm({
      title: `¿Cancelar ${e}?`,
      text: `${e} quedará cancelad@ y no podrá usarse.`,
      confirmText: "Sí, cancelar",
      cancelText: "Volver",
      icon: "warning",
      ...opts,
    });
  },

  async archive(entity, opts = {}) {
    const e = normalizeEntity(entity);

    return alertService.confirm({
      title: `¿Archivar ${e}?`,
      text: `${e} se enviará al historico. Podrás consultar la oferta luego.`,
      confirmText: "Sí, archivar",
      cancelText: "Cancelar",
      icon: "warning",
      ...opts,
    });
  },

  async remove(entity, opts = {}) {
    const e = normalizeEntity(entity);

    return alertService.confirm({
      title: `¿Eliminar ${e}?`,
      text: `Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      icon: "error",
      ...opts,
    });
  },
};
