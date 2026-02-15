/*
    Archivo: OfertaCategory.js
    
    Descripción: Define categorías y modalidades que el backend espera, y ayuda a traducirlas para el frontend.

    Clases relacionadas: 
    - Backend: SIGO.Application.Features.Ofertas.Enums.OfertaCategory
    - Base de datos: Tabla Modalidad
*/

// Modalidades (DB)
export const OfertaModalidad = Object.freeze({
  Presencial: 1,
  Virtual: 2,
  EnLinea: 3,
});

// Categorías (UI / Filtro)
export const OfertaCategory = Object.freeze({
  PresencialVirtual: 1, // modalidad (1,2) y archivado=false
  EnLinea: 2,           // modalidad (3) y archivado=false
  Historico: 3,         // archivado=true
});

// Helpers: Para mas facilidad para el Front (Traducir categorias y modalidades)

// Helper para la categoría histórica (archivado=true)
export const isHistorico = (category) =>
  Number(category) === OfertaCategory.Historico;

// Helper para saber si la categoría requiere elegir modalidad (Presencial/Virtual)
export const requiereModalidad = (category) =>
  Number(category) === OfertaCategory.PresencialVirtual;

// Helper para saber si la categoría es En Línea (modalidad 3 fija)
export const esEnLinea = (category) =>
  Number(category) === OfertaCategory.EnLinea;

// Para duplicar/archivar: modalidad fija si es En Línea
export const modalidadFija = (category) =>
  esEnLinea(category) ? OfertaModalidad.EnLinea : null;

// Modalidades permitidas por categoría (para filtrar dropdowns)
export const modalidadesPermitidasPorCategoria = (category) => {
  if (requiereModalidad(category)) return [OfertaModalidad.Presencial, OfertaModalidad.Virtual];
  if (esEnLinea(category)) return [OfertaModalidad.EnLinea];
  return [];
};

// Helper para mostrar el nombre de la modalidad en la tabla
export const getNombreModalidad = (modalidadId) => {
  switch (Number(modalidadId)) {
    case OfertaModalidad.Presencial:
      return "Presencial";
    case OfertaModalidad.Virtual:
      return "Virtual";
    case OfertaModalidad.EnLinea:
      return "En Línea";
    default:
      return "Desconocida";
  }
};