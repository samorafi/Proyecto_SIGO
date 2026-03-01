using SIGO.Application.Models;
using SIGO.Application.Features.Permanencia4.Dtos;

namespace SIGO.Application.Abstractions
{
    public interface IPermanencia4ExportService
    {
        Task<ExportFileResult> GenerarExcelAsync(Permanencia4MetaDto meta, IReadOnlyList<Permanencia4RowDto> rows, CancellationToken ct);
        Task<ExportFileResult> GenerarPdfAsync(Permanencia4MetaDto meta, IReadOnlyList<Permanencia4RowDto> rows, CancellationToken ct);
    }
}
