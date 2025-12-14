using MediatR;
using Microsoft.AspNetCore.Http;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Commands.ImportarOfertasPresenciales
{
    public class ImportarOfertasPresencialesCommand : IRequest<ImportarOfertasResponseDto>
    {
        /// <summary>
        /// Archivo Excel con las ofertas presenciales/mixtas.
        /// </summary>
        public IFormFile ArchivoExcel { get; set; } = null!;

        /// <summary>
        /// ID del Periodo al cual se asociarán estas ofertas (Ej: I Cuatrimestre 2025).
        /// Se recibe desde el frontend para asegurar la integridad.
        /// </summary>
        public int PeriodoId { get; set; }
    }
}
