// --------------------------------------------------------------
// ResumenEstadosChips.jsx
// Muestra resumen de ofertas por estado
// --------------------------------------------------------------

export default function ResumenEstadosChips({ ofertas }) {

    const total = ofertas.length;

    const contar = (estado) =>
        ofertas.filter(o => o.estado === estado).length;

    return (
        <div className="flex flex-wrap gap-2">

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-[#2B338C]">
                TOTAL: {total}
            </span>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-amber-600">
                PENDIENTES: {contar("Pendiente")}
            </span>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-blue-600">
                ENVIADAS: {contar("Enviada")}
            </span>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-green-600">
                ACEPTADAS: {contar("Aceptada")}
            </span>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-red-600">
                RECHAZADAS: {contar("Rechazada")}
            </span>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-gray-600">
                CANCELADAS: {contar("Cancelada")}
            </span>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-teal-600">
                IMPORTADAS: {contar("Importada")}
            </span>

        </div>
    );
}
