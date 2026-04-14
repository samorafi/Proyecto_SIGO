import { useParams } from "react-router-dom";
import OfertasPagedTable from "./components/OfertasPagedTable";

export default function OfertasEnLineaDetalle() {
  const { periodoId } = useParams();

  return (
    <OfertasPagedTable
      category={2}
      title="100% Virtual"
      initialPeriodoId={periodoId}
      lockPeriodoFilter
      backPath="/dashboard/ofertas/OfertasEnLineaV2"
    />
  );
}
