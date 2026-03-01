using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Models;

namespace SIGO.Application.Features.Permanencia4.Commands.GenerarPermanencia4Pdf
{
    public sealed class GenerarPermanencia4PdfHandler
        : IRequestHandler<GenerarPermanencia4PdfCommand, ExportFileResult>
    {
        private readonly IPermanencia4ExportService _export;

        public GenerarPermanencia4PdfHandler(IPermanencia4ExportService export)
        {
            _export = export;
        }

        public Task<ExportFileResult> Handle(GenerarPermanencia4PdfCommand request, CancellationToken ct)
            => _export.GenerarPdfAsync(request.Meta, request.Rows, ct);
    }
}
