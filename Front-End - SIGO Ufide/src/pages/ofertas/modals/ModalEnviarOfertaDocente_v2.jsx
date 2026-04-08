import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Input,
  Select,
  Option,
  Button,
} from "@material-tailwind/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function ModalEnviarOfertaDocente_v2({
  open,
  onClose,

  ofertaSeleccionada,

  filtroDocente,
  setFiltroDocente,

  docenteId,
  setDocenteId,

  evalPeriodoId,
  setEvalPeriodoId,
  tipoPeriodo,
  setTipoPeriodo,
  periodosOrdenados = [],
  docentesError,
  enviando,

  docentesFiltrados = [],
  periodos = [],
  previewData,

  onEnviar,
  getPeriodoFormatoOfertaById
}) {
  const renderDocenteOptions = () => {
    if (!docentesFiltrados.length) return <Option disabled>No hay docentes</Option>;

    return docentesFiltrados.map((d) => {
      const id = d?.personaId ?? d?.id;
      const nombre = `${d?.nombre ?? ""} ${d?.apellido1 ?? ""} ${d?.apellido2 ?? ""}`.trim();
      const ced = d?.cedula ?? d?.identificacion ?? "";
      return (
        <Option key={id} value={String(id)}>
          {nombre} {ced ? `- ${ced}` : ""}
        </Option>
      );
    });
  };

  const menuPropsSafe = {
    className:
      "z-[99999] max-h-64 overflow-auto bg-white border border-blue-gray-100 rounded-md shadow-xl",
  };

  return (
    <Dialog open={open} handler={onClose} size="md" className="rounded-xl shadow-xl bg-white">
      <DialogHeader className="bg-[#2B338C] text-white font-semibold text-base px-6 py-3 rounded-t-xl flex items-center gap-2 shadow-md">
        <span className="w-2.5 h-2.5 bg-[#FFDA00] rounded-full"></span>
        Enviar oferta a docente
      </DialogHeader>



      <DialogBody className="p-6 bg-gray-50 border-x border-b border-gray-200 space-y-4">
        {!ofertaSeleccionada ? (
          <Typography className="text-md text-blue-gray-700">No hay una oferta seleccionada.</Typography>
        ) : (
          <>

            <div className="grid grid-cols-1 gap-3">
              <Input
                label="Buscar docente por nombre, apellidos o cédula"
                value={filtroDocente}
                onChange={(e) => setFiltroDocente(e.target.value)}
                size="md"
              />

              <Select
                key={`docente-${docenteId || "none"}`}
                label="Docente"
                value={docenteId ? String(docenteId) : ""}
                onChange={(v) => setDocenteId(v || "")}
                selected={() => {
                  const d = (docentesFiltrados || []).find(
                    (x) => String(x?.personaId ?? x?.id) === String(docenteId)
                  );
                  const nombre = `${d?.nombre ?? ""} ${d?.apellido1 ?? d?.primerApellido ?? ""} ${d?.apellido2 ?? d?.segundoApellido ?? ""}`.trim();
                  const ced = d?.cedula ?? d?.identificacion ?? "";
                  return `${nombre}${ced ? ` - ${ced}` : ""}`;
                }}
                menuProps={menuPropsSafe}
              >
                {renderDocenteOptions()}
              </Select>

              {docentesError && (
                <Typography className="text-xs text-red-600 mt-1">
                  {docentesError}
                </Typography>
              )}
            </div>

            {/* Evaluación docente */}
            <div className="grid grid-cols-1 gap-3 mt-2">
              <Select
                label="Tipo de periodo (Evaluación docente)"
                value={tipoPeriodo || ""}
                onChange={(v) => {
                  setTipoPeriodo(v || "");
                  setEvalPeriodoId(""); // reset limpio
                }}
                menuProps={menuPropsSafe}
              >
                <Option value="C">Cuatrimestre (C)</Option>
                <Option value="T">Trimestre (T)</Option>
                <Option value="P">Periodo Mensual (P)</Option>
              </Select>

              <Select
                label="Periodo (Evaluación docente)"
                key={`eval-periodo-${tipoPeriodo}-${periodosOrdenados.map((p) => p.periodoId).join(",")}`}
                value={evalPeriodoId ? String(evalPeriodoId) : ""}
                disabled={!tipoPeriodo}
                onChange={(v) => setEvalPeriodoId(v || "")}
                selected={() => {
                  if (!evalPeriodoId) return "Seleccione";
                  const sel = periodosOrdenados.find((x) => String(x.periodoId) === String(evalPeriodoId));
                  return sel ? `${sel.numero}${sel.tipo} - ${sel.anio}` : "Seleccione";
                }}
                menuProps={menuPropsSafe}
              >
                <Option value="">Seleccione</Option>
                {periodosOrdenados.map((p) => (
                  <Option key={p.periodoId} value={String(p.periodoId)}>
                    {`${p.numero}${p.tipo} - ${p.anio}`}
                  </Option>
                ))}
              </Select>

              <Typography className="text-xs text-blue-gray-600">
                Este valor se usará en el texto: “Sus resultados en la Evaluación Docente del ...”.
              </Typography>
            </div>

            {/* Preview */}
            <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 max-h-80 overflow-auto">
              <Typography className="text-[#2B338C] font-bold text-md mb-2">
                Previsualización del correo
              </Typography>

              {!previewData ? (
                <Typography className="text-sm text-blue-gray-700">—</Typography>
              ) : (
                <CorreoPreview {...previewData} />
              )}
            </div>
          </>
        )}
      </DialogBody>

      <DialogFooter className="bg-gray-50 border-t border-gray-200 px-5 py-3 rounded-b-xl flex justify-end gap-2">
        <Button variant="outlined" className="border-[#2B338C] text-[#2B338C]" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          className="bg-green-600 text-white font-semibold flex items-center gap-2"
          onClick={onEnviar}
          disabled={enviando || !ofertaSeleccionada}
        >
          {enviando ? "Enviando..." : "Enviar oferta"}
          <PaperAirplaneIcon className="h-4 w-4" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function CorreoPreview({
  periodoTxt,
  gradoTxt,
  carreraTxt,
  sedeTxt,
  codigoTxt,
  materiaTxt,
  grupoTxt,
  diaTxt,
  horarioTxt,
  matriculaTxt,
  accionTxt,
  profesorTxt,
  evalPeriodoTxt,
  modalidadTxt,
}) {
  const esEnLinea = String(modalidadTxt || "").trim().toLowerCase() === "en línea";
  const horarioHeader = esEnLinea ? "Horario Sesión Sincrónica" : "Horario";

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "#111827",
        color: "white",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div className="text-sm font-semibold mb-3" style={{ color: "#E5E7EB" }}>
        IMPORTANTE: NOMBRAMIENTO - {periodoTxt} -
      </div>

      <div className="text-sm leading-6" style={{ color: "#F9FAFB" }}>
        <div>Estimado/a</div>
        <div>Es un gusto saludarle.</div>
        <div className="mt-2">
          Quisiera confirmar su disponibilidad para impartir lecciones en el <b>{periodoTxt}</b> y, en caso afirmativo,
          conocer su aceptación para este posible nombramiento.
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 760 }}>
          <thead>
            <tr>
              {["Grado", "Carrera", "Sede", "Periodo", "Código", "Materia", "Grupo", "Día", horarioHeader, "Matrícula", "Acción", "Profesor"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    background: "#1F2937",
                    color: "#F9FAFB",
                    borderTop: "1px solid #374151",
                    borderBottom: "1px solid #374151",
                    borderLeft: "1px solid #374151",
                  }}
                >
                  {h}
                </th>
              ))}
              <th style={{ borderTop: "1px solid #374151", borderBottom: "1px solid #374151", borderRight: "1px solid #374151", background: "#1F2937" }} />
            </tr>
          </thead>
          <tbody>
            <tr>
              {[gradoTxt, carreraTxt, sedeTxt, periodoTxt, codigoTxt, materiaTxt, grupoTxt, diaTxt, horarioTxt, matriculaTxt, accionTxt, profesorTxt].map((v, idx) => (
                <td
                  key={idx}
                  style={{
                    padding: "8px 10px",
                    background: "#111827",
                    color: "#E5E7EB",
                    borderBottom: "1px solid #374151",
                    borderLeft: "1px solid #374151",
                    verticalAlign: "top",
                  }}
                >
                  {String(v)}
                </td>
              ))}
              <td style={{ borderBottom: "1px solid #374151", borderRight: "1px solid #374151" }} />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm leading-6" style={{ color: "#F9FAFB" }}>
        <div>Asimismo le recuerdo que este nombramiento está sujeto a:</div>
        <ul className="mt-2 space-y-2">
          {[
            `Sus resultados en la Evaluación Docente del ${evalPeriodoTxt}.`,
            "La matrícula de los cursos asignados.",
            "La apertura de los cursos en Reserva, los cuales se habilitan bajo demanda a lo largo del periodo de matrícula. No hay una fecha exacta para su apertura y esta puede darse incluso en la semana 17.",
            "La asignación de los cursos es enviada a Procesos Académicos, departamento encargado de gestionar la asignación a nivel de sistema, cuando esto suceda usted podrá visualizar los cursos en el SAM y Campus Virtual.",
          ].map((txt, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span
                style={{
                  display: "inline-flex",
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "#7C3AED",
                  color: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  marginTop: 2,
                  flex: "0 0 auto",
                }}
              >
                ✓
              </span>
              <span style={{ color: "#E5E7EB" }}>{txt}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          {esEnLinea ? "Favor confirmar horario sincrónico." : "Quedo atenta a su confirmación."}
        </div>
        <div className="mt-2">Saludos cordiales,</div>
        <div className="font-semibold" style={{ color: "#F9FAFB" }}>
          Coordinación Académica
        </div>

        <div className="mt-3 text-xs" style={{ color: "#9CA3AF" }}>
          Nota: En el correo real se incluirán los enlaces para aceptar o rechazar la oferta.
        </div>
      </div>
    </div>
  );
}
