using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Models;

namespace SIGO.Application.Features.Permanencia4.Commands.GenerarPermanencia4Excel
{
    public sealed class GenerarPermanencia4ExcelHandler
        : IRequestHandler<GenerarPermanencia4ExcelCommand, ExportFileResult>
    {
        private readonly IPermanencia4ExportService _export;

        public GenerarPermanencia4ExcelHandler(IPermanencia4ExportService export)
        {
            _export = export;
        }

        public Task<ExportFileResult> Handle(GenerarPermanencia4ExcelCommand request, CancellationToken ct)
            => _export.GenerarExcelAsync(request.Meta, request.Rows, ct);
    }
}
