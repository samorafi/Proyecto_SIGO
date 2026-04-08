import { useMemo, useState } from "react";
import { Card, Typography, Input } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

import PageTitle from "@/components/ui/Title/PageTitle";
import { FormButton, ArchiveButton, DuplicateButton } from "@/components/ui/Buttons";

import { useOfertasPeriodos, useArchivarOfertas_v2, useDuplicarOfertas_v2 } from "./hooks";
import { usePeriodosApi } from "@/hooks/usePeriodosApi";
import { useCatalogos } from "@/hooks/useCatalogos";

import { alertService } from "@/services/alert.service";
import { entityConfirm } from "@/services/entityConfirm.service";
import { GuardarOferta } from "@/pages/ofertas/functions";

import {
  ModalArchivarOfertas_v2,
  ModalDuplicarOfertas_v2,
  ModalRegistrarOfertas_v2,
} from "./modals";

function getDetailPath(category, periodoId) {
  return Number(category) === 2
    ? `/dashboard/ofertas/OfertasEnLineaV2/periodo/${periodoId}`
    : `/dashboard/ofertas/OfertasPresencialesVirtualesV2/periodo/${periodoId}`;
}

function parsePeriodo(periodo) {
  const raw = String(periodo || "").trim().toUpperCase();
  const match = raw.match(/^(\d+)\s*([A-Z]+)\s*[,/-]?\s*(\d{4})$/);

  if (!match) {
    return {
      numero: 0,
      tipo: "",
      anio: 0,
    };
  }

  return {
    numero: Number(match[1]),
    tipo: match[2],
    anio: Number(match[3]),
  };
}

export default function OfertasByPeriodoPage({ category, title }) {
  const navigate = useNavigate();

  const { items, loading, error, refresh } = useOfertasPeriodos(category);
  const { periodos } = usePeriodosApi();

  const {
    cursos,
    sedes,
    modalidades,
    horarios,
    coordinadores,
  } = useCatalogos();

  const [periodoSearch, setPeriodoSearch] = useState("");

  const periodosOrdenados = useMemo(() => {
    const q = String(periodoSearch || "").trim().toLowerCase();

    return [...(items || [])]
      .filter((item) => {
        if (!q) return true;
        return String(item.periodo || "").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const pa = parsePeriodo(a.periodo);
        const pb = parsePeriodo(b.periodo);

        if (pb.anio !== pa.anio) return pb.anio - pa.anio;
        if (pb.tipo !== pa.tipo) return pb.tipo.localeCompare(pa.tipo);
        return pb.numero - pa.numero;
      });
  }, [items, periodoSearch]);

  // ---------------- ARCHIVAR ----------------
  const {
    openModal: openArchivarModal,
    setOpenModal: setOpenArchivarModal,
    abrirModal: abrirArchivarModal,

    tipoPeriodo: tipoPeriodoArchivar,
    setTipoPeriodo: setTipoPeriodoArchivar,

    selectedPeriodo: selectedPeriodoArchivar,
    setSelectedPeriodo: setSelectedPeriodoArchivar,

    catHistorico: isHistoricoArchivar,
    catRequiereModalidad,
    bloquearModalidad,

    modalidadesParaSelect,
    selectedModalidad: selectedModalidadArchivar,
    setSelectedModalidad: setSelectedModalidadArchivar,

    periodosDisponibles,
    avisoArchivar,
    archivar,
    loadingArchivar,
    mensajeArchivar,
  } = useArchivarOfertas_v2(periodos, refresh, category);

  // ---------------- DUPLICAR ----------------
  const {
    openModal: openDuplicarModal,
    setOpenModal: setOpenDuplicarModal,
    abrirModalDuplicar: abrirDuplicarModal,

    tipoPeriodo: tipoPeriodoDuplicar,
    setTipoPeriodo: setTipoPeriodoDuplicar,

    periodoOrigen,
    setPeriodoOrigen,
    periodoDestino,
    setPeriodoDestino,

    selectedModalidad: selectedModalidadDuplicar,
    setSelectedModalidad: setSelectedModalidadDuplicar,

    periodosOrigenFiltrados,
    periodosDestinoFiltrados,
    duplicar,
    loadingDuplicar,
    avisoCanceladas,

    catHistorico: isHistoricoDuplicar,
    catRequiereModalidad: catRequiereModalidadDuplicar,
    modalidadesPermitidas: modalidadesPermitidasDuplicar,
    bloquearModalidad: bloquearModalidadDuplicar,
  } = useDuplicarOfertas_v2(periodos, refresh, category);

  // ---------------- REGISTRAR ----------------
  const [openRegistrar, setOpenRegistrar] = useState(false);
  const [registrarLoading, setRegistrarLoading] = useState(false);

  const [form, setForm] = useState({
    cursoId: "",
    sedeId: "",
    horarioId: "",
    periodoId: "",
    tipoPeriodo: "",
    coordinadorId: "",
    comentarios: "",
    accionId: 1,
    modalidadId: "",
    estadoOfertaId: 2,
    cupo: null,
    matriculados: null,
    grupo: "",
  });

  const ACCIONES = [
    { id: 1, nombre: "Abrir Curso" },
    { id: 2, nombre: "Asignar Profesor" },
    { id: 3, nombre: "Nombrado" },
    { id: 4, nombre: "Cambiar Profesor" },
    { id: 5, nombre: "Cerrar Curso" },
    { id: 6, nombre: "Reserva" },
    { id: 7, nombre: "Suficiencia" },
    { id: 8, nombre: "Cerrado" },
  ];

  const validarFormulario = () => {
    const camposRequeridos = [
      form.cursoId,
      form.sedeId,
      form.horarioId,
      form.periodoId,
      form.tipoPeriodo,
      form.coordinadorId,
      form.modalidadId,
      form.accionId,
    ];

    const hayCampoVacio = camposRequeridos.some(
      (campo) => campo === "" || campo === null || campo === undefined
    );

    if (hayCampoVacio) {
      alertService.error(
        "Información incompleta",
        "Debe completar toda la información para registrar una oferta."
      );
      return false;
    }

    return true;
  };

  const handleOpenNueva = () => {
    setForm({
      cursoId: "",
      sedeId: "",
      horarioId: "",
      periodoId: "",
      tipoPeriodo: "",
      coordinadorId: "",
      comentarios: "",
      accionId: 1,
      modalidadId: "",
      estadoOfertaId: 2,
      cupo: null,
      matriculados: null,
      grupo: "",
    });
    setOpenRegistrar(true);
  };

  const handleCloseRegistrar = () => setOpenRegistrar(false);

  const handleRegistrar = async () => {
    const ok = await entityConfirm.create("la oferta");
    if (!ok) return;

    if (!validarFormulario()) return;

    try {
      setRegistrarLoading(true);
      alertService.loading("Registrando...", "Guardando la oferta");

      const result = await GuardarOferta(null, form);

      alertService.close();

      if (!result?.ok) {
        alertService.error("Error al registrar", result?.error || "Intente nuevamente.");
        return;
      }

      alertService.toastSuccess("Oferta registrada correctamente");
      setOpenRegistrar(false);
      refresh();
    } catch (err) {
      alertService.close();
      alertService.apiError(err, "No se pudo registrar la oferta");
    } finally {
      setRegistrarLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <PageTitle>{title}</PageTitle>
          <Typography className="mt-1 text-blue-gray-600">
            Seleccione un período para ver sus ofertas activas.
          </Typography>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          {!isHistoricoArchivar && (
            <FormButton onClick={handleOpenNueva} className="w-full sm:w-auto">
              Nueva oferta
            </FormButton>
          )}

          {!isHistoricoArchivar && (
            <ArchiveButton onClick={abrirArchivarModal} className="w-full sm:w-auto">
              Archivar ofertas
            </ArchiveButton>
          )}

          {!isHistoricoDuplicar && (
            <DuplicateButton onClick={abrirDuplicarModal} className="w-full sm:w-auto">
              Duplicar ofertas
            </DuplicateButton>
          )}
        </div>
      </div>

      <Card className="p-4 mb-4 rounded-2xl shadow-sm">
        <div className="max-w-md">
          <Input
            label="Buscar período"
            value={periodoSearch}
            onChange={(e) => setPeriodoSearch(e.target.value)}
          />
        </div>
      </Card>

      {error ? <div className="p-3 text-red-600">{error}</div> : null}

      {loading ? (
        <Card className="p-6">Cargando períodos...</Card>
      ) : periodosOrdenados.length === 0 ? (
        <Card className="p-6 text-blue-gray-600">
          No hay ofertas activas disponibles para mostrar por período.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {periodosOrdenados.map((item) => (
            <button
              key={item.periodoId}
              type="button"
              onClick={() => navigate(getDetailPath(category, item.periodoId))}
              className="text-left"
            >
              <Card className="p-5 rounded-2xl shadow-md border border-blue-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Typography variant="h5" className="text-[#2B338C] font-bold">
                  {item.periodo}
                </Typography>

                <Typography className="mt-2 text-blue-gray-600">
                  Ofertas activas en este período
                </Typography>

                <div className="mt-4 inline-flex items-center rounded-full bg-[#2B338C] px-3 py-1 text-sm font-bold text-white w-fit">
                  {item.totalOfertas} oferta{item.totalOfertas === 1 ? "" : "s"}
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      <ModalArchivarOfertas_v2
        open={openArchivarModal}
        onClose={() => setOpenArchivarModal(false)}
        tipoPeriodo={tipoPeriodoArchivar}
        setTipoPeriodo={setTipoPeriodoArchivar}
        selectedPeriodo={selectedPeriodoArchivar}
        setSelectedPeriodo={setSelectedPeriodoArchivar}
        selectedModalidad={selectedModalidadArchivar}
        setSelectedModalidad={setSelectedModalidadArchivar}
        infoArchivar={avisoArchivar}
        catRequiereModalidad={catRequiereModalidad}
        bloquearModalidad={bloquearModalidad}
        catHistorico={isHistoricoArchivar}
        modalidades={modalidadesParaSelect}
        periodosDisponibles={periodosDisponibles}
        loadingArchivar={loadingArchivar}
        mensajeArchivar={mensajeArchivar}
        onArchivar={archivar}
        onArchived={refresh}
      />

      <ModalDuplicarOfertas_v2
        open={openDuplicarModal}
        onClose={() => setOpenDuplicarModal(false)}
        mostrarModalidad={catRequiereModalidadDuplicar}
        bloquearModalidad={bloquearModalidadDuplicar}
        modalidadesPermitidas={modalidadesPermitidasDuplicar}
        infoCanceladas={avisoCanceladas}
        tipoPeriodo={tipoPeriodoDuplicar}
        setTipoPeriodo={setTipoPeriodoDuplicar}
        periodoOrigen={periodoOrigen}
        setPeriodoOrigen={setPeriodoOrigen}
        periodoDestino={periodoDestino}
        setPeriodoDestino={setPeriodoDestino}
        selectedModalidad={selectedModalidadDuplicar}
        setSelectedModalidad={setSelectedModalidadDuplicar}
        periodosOrigenFiltrados={periodosOrigenFiltrados}
        periodosDestinoFiltrados={periodosDestinoFiltrados}
        loadingDuplicar={loadingDuplicar}
        onDuplicar={duplicar}
      />

      <ModalRegistrarOfertas_v2
        open={openRegistrar}
        onClose={handleCloseRegistrar}
        loading={registrarLoading}
        category={category}
        form={form}
        setForm={setForm}
        onRegistrar={handleRegistrar}
        cursos={cursos}
        sedes={sedes}
        horarios={horarios}
        periodos={periodos}
        coordinadores={coordinadores}
        estados={ACCIONES.map((a) => ({ accionId: a.id, nombre: a.nombre }))}
        modalidades={modalidades}
      />
    </>
  );
}