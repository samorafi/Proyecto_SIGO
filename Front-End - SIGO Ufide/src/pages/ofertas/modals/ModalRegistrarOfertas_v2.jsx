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

  // reglas por categoría
  const mostrarModalidad = !isHistorico(category);
  const modalidadesPermitidas = modalidadesPermitidasPorCategoria(category);
  const fija = modalidadFija(category); // 3 si EnLinea, null si no

  const modalidadesFiltradas = useMemo(() => {
    let base = modalidades ?? [];
    if (modalidadesPermitidas.length > 0) {
      base = base.filter((m) => modalidadesPermitidas.includes(m.modalidadId));
    }
    return base;
  }, [modalidades, modalidadesPermitidas]);

  // Autoselección de modalidad:
  // - EnLinea => fija
  // - o si solo queda una opción en el filtro
  useEffect(() => {
    if (!mostrarModalidad) return;

    const targetId =
      fija ?? (modalidadesFiltradas.length === 1 ? modalidadesFiltradas[0].modalidadId : null);

    if (targetId && Number(form?.modalidadId) !== Number(targetId)) {
      setForm((p) => ({ ...p, modalidadId: Number(targetId) }));
    }
  }, [mostrarModalidad, fija, modalidadesFiltradas, form?.modalidadId, setForm]);

  // Deshabilitar si:
  // - EnLinea (fija), o
  // - no requiere elección (por seguridad), o
  // - solo hay una opción
  const bloquearModalidad =
    fija !== null || !requiereModalidad(category) || modalidadesFiltradas.length <= 1;

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
            onChange={(v) => setForm((p) => ({ ...p, cursoId: Number(v) }))}
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
            onChange={(v) => setForm((p) => ({ ...p, sedeId: Number(v) }))}
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
                periodoId: "", // reset limpio
              }))
            }
          >
            <Option value="C">Cuatrimestre (C)</Option>
            <Option value="T">Trimestre (T)</Option>
            <Option value="P">Periodo Mensual (P)</Option>
          </Select>

          <Select
            label="Periodo"
            key={`periodo-${form.tipoPeriodo}-${periodosOrdenados.map(p => p.periodoId).join(",")}`}
            value={form.periodoId ? String(form.periodoId) : ""}
            disabled={!form.tipoPeriodo}
            onChange={(v) => setForm((prev) => ({ ...prev, periodoId: v || "" }))}
            selected={() => {
              if (!form.periodoId) return "Seleccione";
              const sel = periodosOrdenados.find(x => String(x.periodoId) === String(form.periodoId));
              return sel ? `${sel.numero}${sel.tipo} - ${sel.anio}` : "Seleccione";
            }}
            containerProps={{ className: "min-w-0" }}
            menuProps={{
              className:
                "z-[99999] bg-white border border-blue-gray-100 rounded-md shadow-[0_12px_40px_rgba(0,0,0,.25)]",
              placement: "bottom-start",
            }}
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
            onChange={(v) => setForm((p) => ({ ...p, horarioId: Number(v) }))}
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
            onChange={(v) => setForm((p) => ({ ...p, coordinadorId: Number(v) }))}
          >
            {coordinadores.map((c) => (
              <Option key={c.id} value={String(c.id)}>
                {`${c.nombre} ${c.primerApellido} ${c.segundoApellido}`.trim()}
              </Option>
            ))}
          </Select>
        </div>

        {/* ---------------- MODALIDAD ---------------- */}
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
                onChange={(v) => setForm((p) => ({ ...p, modalidadId: Number(v) }))}
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

        {/* ---------------- CUPO Y MATRICULADOS ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">
          <div>
            <p className="text-[#2B338C] font-bold text-md mb-1">Cupo</p>
            <Input
              type="number"
              label="Cupo"
              value={form.cupo ?? ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  cupo: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </div>

          <div>
            <p className="text-[#2B338C] font-bold text-md mb-1">
              Estudiantes matriculados
            </p>
            <Input
              type="number"
              label="Matriculados"
              value={form.matriculados ?? ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  matriculados: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        {/* ---------------- ACCIÓN ---------------- */}
        <div className="mt-4">
          <Select
            label="Acción"
            value={form.accionId ? String(form.accionId) : ""}
            onChange={(v) => setForm((p) => ({ ...p, accionId: Number(v) }))}
          >
            {estados.map((e) => (
              <Option key={e.accionId} value={String(e.accionId)}>
                {e.nombre}
              </Option>
            ))}
          </Select>
        </div>

        {/* ---------------- COMENTARIOS ---------------- */}
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
