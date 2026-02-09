// --------------------------------------------------------------
// ResumenEstadosChips.jsx
// Muestra resumen global de ofertas por estado (si no existe, muestra 0)
// --------------------------------------------------------------

const ESTADOS = [
  { key: "Pendiente", label: "PENDIENTES", color: "bg-amber-600" },
  { key: "Enviada", label: "ENVIADAS", color: "bg-blue-600" },
  { key: "Aceptada", label: "ACEPTADAS", color: "bg-green-600" },
  { key: "Rechazada", label: "RECHAZADAS", color: "bg-red-600" },
  { key: "Cancelada", label: "CANCELADAS", color: "bg-gray-600" },
  { key: "Importada", label: "IMPORTADAS", color: "bg-teal-600" },
];

export default function ResumenEstadosChips({ data }) {

  if (!data) return null;

  // Convertimos porEstado a un mapa para acceso rápido
  const map = {};
  data.porEstado.forEach(e => {
    map[e.estado] = e.count;
  });

  return (
    <div className="flex flex-wrap gap-2 mb-3">

      {/* TOTAL */}
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white bg-[#2B338C]">
        TOTAL: {data.total}
      </span>

      {/* ESTADOS */}
      {ESTADOS.map(e => (
        <span
          key={e.key}
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${e.color}`}
        >
          {e.label}: {map[e.key] ?? 0}
        </span>
      ))}

    </div>
  );
}
