import { useParams } from "react-router-dom";
import OfertasPagedTable from "./components/OfertasPagedTable";

export default function OfertasPresencialesVirtualesDetalle() {
  const { periodoId } = useParams();

  return (
    <OfertasPagedTable
      category={1}
      title="Presencial Y En Línea"
      initialPeriodoId={periodoId}
      lockPeriodoFilter
      backPath="/dashboard/ofertas/OfertasPresencialesVirtualesV2"
    />
  );
}
