import { useEffect, useMemo } from "react";
import { Select, Option, Input, Button } from "@material-tailwind/react";
import AppModal from "@/components/ui/Modals/AppModal";
import { usePeriodos } from "@/hooks/usePeriodos";

import {
  isHistorico,
  requiereModalidad,
  modalidadFija,
  modalidadesPermitidasPorCategoria,
} from "../constants/OfertaCategory";

export default function ModalRegistrarOfertas_v2({
  open,
  onClose,
  loading,
  category,
  form,
  setForm,
  onRegistrar,
  cursos = [],
  sedes = [],
  horarios = [],
  periodos = [],
  coordinadores = [],
  estados = [],
  modalidades = [],
}) {
  const { periodosOrdenados } = usePeriodos(periodos, form?.tipoPeriodo);

  const mostrarModalidad = !isHistorico(category);
  const modalidadesPermitidas = modalidadesPermitidasPorCategoria(category);
  const fija = modalidadFija(category);

  const modalidadesFiltradas = useMemo(() => {
    let base = modalidades ?? [];
    if (modalidadesPermitidas.length > 0) {
      base = base.filter((m) => modalidadesPermitidas.includes(m.modalidadId));
    }
    return base;
  }, [modalidades, modalidadesPermitidas]);

  useEffect(() => {
    if (!mostrarModalidad) return;

    const targetId =
      fija ?? (modalidadesFiltradas.length === 1 ? modalidadesFiltradas[0].modalidadId : null);

    if (targetId && Number(form?.modalidadId) !== Number(targetId)) {
      setForm((p) => ({ ...p, modalidadId: Number(targetId) }));
    }
  }, [mostrarModalidad, fija, modalidadesFiltradas, form?.modalidadId, setForm]);

  const bloquearModalidad =
    fija !== null || !requiereModalidad(category) || modalidadesFiltradas.length <= 1;

  const menuPropsSafe = {
    className:
      "z-[99999] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)]",
    placement: "bottom-start",
  };

  const containerPropsSafe = { className: "min-w-0" };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      size="md"
      title="Registrar Nueva Oferta"
      footer={
        <>
          <Button
            variant="outlined"
            className="border-[#2B338C] text-[#2B338C] mr-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            className="bg-[#FFDA00] text-[#2B338C] font-semibold"
            onClick={onRegistrar}
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </>
      }
    >
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md text-[15px] leading-tight">
        <h2 className="text-[#2B338C] font-bold text-base mb-2 border-b border-gray-300 pb-1">
          Datos de la Oferta
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-2">
          <Select
            label="Curso"
            value={form.cursoId ? String(form.cursoId) : ""}
            onChange={(v) => setForm((p) => ({ ...p, cursoId: v ? Number(v) : "" }))}
            selected={() => {
              if (!form.cursoId) return undefined;
              const sel = cursos.find((x) => String(x.cursoId) === String(form.cursoId));
              return sel?.nombre;
            }}
            containerProps={containerPropsSafe}
            menuProps={menuPropsSafe}
          >
            {cursos.map((c) => (
              <Option key={c.cursoId} value={String(c.cursoId)}>
                {c.nombre}
              </Option>
            ))}
          </Select>

          <Select
            label="Sede"
            value={form.sedeId ? String(form.sedeId) : ""}
            onChange={(v) => setForm((p) => ({ ...p, sedeId: v ? Number(v) : "" }))}
            selected={() => {
              if (!form.sedeId) return undefined;
              const sel = sedes.find((x) => String(x.sedeId) === String(form.sedeId));
              return sel?.nombre;
            }}
            containerProps={containerPropsSafe}
            menuProps={menuPropsSafe}
          >
            {sedes.map((s) => (
              <Option key={s.sedeId} value={String(s.sedeId)}>
                {s.nombre}
              </Option>
            ))}
          </Select>

          <Select
            label="Tipo de periodo"
            value={form.tipoPeriodo || ""}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                tipoPeriodo: v || "",
                periodoId: "",
              }))
            }
            selected={() => {
              if (!form.tipoPeriodo) return undefined;
              if (form.tipoPeriodo === "C") return "Cuatrimestre";
              if (form.tipoPeriodo === "T") return "Trimestre";
              if (form.tipoPeriodo === "P") return "Periodo Mensual";
              return undefined;
            }}
            containerProps={containerPropsSafe}
            menuProps={menuPropsSafe}
          >
            <Option value="C">Cuatrimestre (C)</Option>
            <Option value="T">Trimestre (T)</Option>
            <Option value="P">Periodo Mensual (P)</Option>
          </Select>

          <Select
            label="Periodo"
            key={`periodo-${form.tipoPeriodo}-${periodosOrdenados.map((p) => p.periodoId).join(",")}`}
            value={form.periodoId ? String(form.periodoId) : ""}
            disabled={!form.tipoPeriodo}
            onChange={(v) => setForm((prev) => ({ ...prev, periodoId: v || "" }))}
            selected={() => {
              if (!form.periodoId) return undefined;
              const sel = periodosOrdenados.find(
                (x) => String(x.periodoId) === String(form.periodoId)
              );
              return sel ? `${sel.numero}${sel.tipo} - ${sel.anio}` : undefined;
            }}
            containerProps={containerPropsSafe}
            menuProps={menuPropsSafe}
          >
            <Option value="">Seleccione</Option>
            {periodosOrdenados.map((p) => (
              <Option key={p.periodoId} value={String(p.periodoId)}>
                {`${p.numero}${p.tipo} - ${p.anio}`}
              </Option>
            ))}
          </Select>

          <Select
            label="Horario"
            value={form.horarioId ? String(form.horarioId) : ""}
            onChange={(v) => setForm((p) => ({ ...p, horarioId: v ? Number(v) : "" }))}
            selected={() => {
              if (!form.horarioId) return undefined;
              const sel = horarios.find((x) => String(x.horarioId) === String(form.horarioId));
              return sel ? `${sel.dia} - ${sel.rango}` : undefined;
            }}
            containerProps={containerPropsSafe}
            menuProps={menuPropsSafe}
          >
            {horarios.map((h) => (
              <Option key={h.horarioId} value={String(h.horarioId)}>
                {`${h.dia} - ${h.rango}`}
              </Option>
            ))}
          </Select>

          <Select
            label="Coordinador"
            value={form.coordinadorId ? String(form.coordinadorId) : ""}
            onChange={(v) => setForm((p) => ({ ...p, coordinadorId: v ? Number(v) : "" }))}
            selected={() => {
              if (!form.coordinadorId) return undefined;
              const sel = coordinadores.find((x) => String(x.id) === String(form.coordinadorId));
              return sel
                ? `${sel.nombre} ${sel.primerApellido} ${sel.segundoApellido}`.trim()
                : undefined;
            }}
            containerProps={containerPropsSafe}
            menuProps={menuPropsSafe}
          >
            {coordinadores.map((c) => (
              <Option key={c.id} value={String(c.id)}>
                {`${c.nombre} ${c.primerApellido} ${c.segundoApellido}`.trim()}
              </Option>
            ))}
          </Select>
        </div>

        {mostrarModalidad && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">
            <div>
              <p className="text-[#2B338C] font-bold text-md mb-1">
                Modalidad de Oferta
              </p>

              <Select
                label="Modalidad"
                value={form.modalidadId ? String(form.modalidadId) : ""}
                disabled={bloquearModalidad}
                onChange={(v) => setForm((p) => ({ ...p, modalidadId: v ? Number(v) : "" }))}
                selected={() => {
                  if (!form.modalidadId) return undefined;
                  const sel = modalidadesFiltradas.find(
                    (x) => String(x.modalidadId) === String(form.modalidadId)
                  );
                  return sel?.nombre;
                }}
                containerProps={containerPropsSafe}
                menuProps={menuPropsSafe}
              >
                {modalidadesFiltradas.map((m) => (
                  <Option key={m.modalidadId} value={String(m.modalidadId)}>
                    {m.nombre}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">
          <div>
            <p className="text-[#2B338C] font-bold text-md mb-1">Cupo</p>
            <Input
              type="text"
              label="Cupo"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.cupo ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setForm((p) => ({
                    ...p,
                    cupo: value === "" ? null : Number(value),
                  }));
                }
              }}
            />
          </div>

          <div>
            <p className="text-[#2B338C] font-bold text-md mb-1">
              Estudiantes matriculados
            </p>
            <Input
              type="text"
              label="Matriculados"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.matriculados ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setForm((p) => ({
                    ...p,
                    matriculados: value === "" ? null : Number(value),
                  }));
                }
              }}
            />
          </div>
        </div>

        <div className="mt-4">
          <Select
            label="Acción"
            value={form.accionId ? String(form.accionId) : ""}
            onChange={(v) => setForm((p) => ({ ...p, accionId: v ? Number(v) : "" }))}
            selected={() => {
              if (!form.accionId) return undefined;
              const sel = estados.find((x) => String(x.accionId) === String(form.accionId));
              return sel?.nombre;
            }}
            containerProps={containerPropsSafe}
            menuProps={menuPropsSafe}
          >
            {estados.map((e) => (
              <Option key={e.accionId} value={String(e.accionId)}>
                {e.nombre}
              </Option>
            ))}
          </Select>
        </div>

        <div className="mt-4">
          <Input
            label="Comentarios"
            value={form.comentarios ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, comentarios: e.target.value }))}
          />
        </div>
      </div>
    </AppModal>
  );
}