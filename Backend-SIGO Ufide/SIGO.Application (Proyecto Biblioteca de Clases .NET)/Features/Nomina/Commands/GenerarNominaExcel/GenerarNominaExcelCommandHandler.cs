using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Dto;

namespace SIGO.Application.Features.Nomina.Commands.GenerarNominaExcel
{
    public class GenerarNominaExcelCommandHandler : IRequestHandler<GenerarNominaExcelCommand, ExportFileDto>
    {
        private readonly INominaExportService _exporter;
        public GenerarNominaExcelCommandHandler(INominaExportService exporter) => _exporter = exporter;

        public Task<ExportFileDto> Handle(GenerarNominaExcelCommand request, CancellationToken ct)
        {
            var fileName = $"Nomina_Docentes_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";
            return Task.FromResult(_exporter.ExportarExcel(request.Meta, request.Rows, fileName));
        }
    }
}
