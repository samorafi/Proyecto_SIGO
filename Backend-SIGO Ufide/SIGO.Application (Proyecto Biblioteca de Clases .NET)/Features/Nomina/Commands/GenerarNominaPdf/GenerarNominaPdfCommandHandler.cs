using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Dto;

namespace SIGO.Application.Features.Nomina.Commands.GenerarNominaPdf
{
    public class GenerarNominaPdfCommandHandler : IRequestHandler<GenerarNominaPdfCommand, ExportFileDto>
    {
        private readonly INominaExportService _exporter;
        public GenerarNominaPdfCommandHandler(INominaExportService exporter) => _exporter = exporter;

        public Task<ExportFileDto> Handle(GenerarNominaPdfCommand request, CancellationToken ct)
        {
            var fileName = $"Nomina_Docentes_{DateTime.Now:yyyyMMdd_HHmm}.pdf";
            return Task.FromResult(_exporter.ExportarPdf(request.Meta, request.Rows, fileName));
        }
    }
}
