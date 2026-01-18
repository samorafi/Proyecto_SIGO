using MediatR;
using SIGO.Application.Common.Dto;

namespace SIGO.Application.Features.Nomina.Queries.ExportarNominaExcel
{
    public class ExportarNominaExcelQuery : IRequest<ExportFileDto>
    {
        // opcional: filtros (EstadoId, Periodo, etc.)
    }
}
