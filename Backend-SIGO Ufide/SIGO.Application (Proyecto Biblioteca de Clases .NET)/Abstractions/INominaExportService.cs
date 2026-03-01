using SIGO.Application.Common.Dto;
using SIGO.Application.Features.Nomina.Dto;

namespace SIGO.Application.Abstractions
{
    public interface INominaExportService
    {
        ExportFileDto ExportarExcel(NominaDocenteMetaDto meta, List<NominaDocenteRowDto> rows, string fileName);
        ExportFileDto ExportarPdf(NominaDocenteMetaDto meta, List<NominaDocenteRowDto> rows, string fileName);
    }
}
