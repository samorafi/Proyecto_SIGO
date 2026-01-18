using MediatR;
using SIGO.Application.Features.Permanencia4.Dtos;
using SIGO.Application.Models;

namespace SIGO.Application.Features.Permanencia4.Commands.GenerarPermanencia4Excel
{
    public sealed class GenerarPermanencia4ExcelCommand : IRequest<ExportFileResult>
    {
        public Permanencia4MetaDto Meta { get; set; } = new();
        public List<Permanencia4RowDto> Rows { get; set; } = new();
    }
}
