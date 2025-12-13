using MediatR;
using Microsoft.AspNetCore.Http;
using SIGO.Application.Features.Docentes.Dto; // Asegúrate de que este using apunte a donde está tu ResponseDto

namespace SIGO.Application.Features.Docentes.Commands.ImportarDocentes
{
    // Esta clase DEBE ser publica para que el Validator la vea
    public class ImportarDocentesCommand : IRequest<ImportarDocentesResponseDto>
    {
        public IFormFile ArchivoExcel { get; set; }
    }
}