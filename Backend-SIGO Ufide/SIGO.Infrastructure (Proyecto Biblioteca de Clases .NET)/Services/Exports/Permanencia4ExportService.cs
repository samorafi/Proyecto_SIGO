using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Permanencia4.Dtos;
using SIGO.Application.Models;

namespace SIGO.Infrastructure.Services.Exports
{
    public sealed class Permanencia4ExportService : IPermanencia4ExportService
    {
        private static string Stamp() => DateTime.Now.ToString("yyyyMMdd_HHmm");
        private const string Azul = "#2B338C";

        public Task<ExportFileResult> GenerarExcelAsync(Permanencia4MetaDto meta, IReadOnlyList<Permanencia4RowDto> rows, CancellationToken ct)
        {
            using var wb = new XLWorkbook();
            var ws = wb.AddWorksheet("Permanencia +4");

            // Título
            ws.Cell(1, 1).Value = "DOCENTES CON MÁS DE 4 AÑOS DE PERMANENCIA";
            ws.Range(1, 1, 1, 4).Merge();
            ws.Range(1, 1, 1, 4).Style.Font.Bold = true;
            ws.Range(1, 1, 1, 4).Style.Font.FontSize = 14;
            ws.Range(1, 1, 1, 4).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            // Total registros
            ws.Cell(2, 1).Value = $"Total registros: {meta.TotalRegistros}";
            ws.Range(2, 1, 2, 4).Merge();
            ws.Range(2, 1, 2, 4).Style.Font.Bold = true;

            // Header tabla
            var headerRow = 4;
            ws.Cell(headerRow, 1).Value = "Nombre del docente";
            ws.Cell(headerRow, 2).Value = "Periodo de ingreso";
            ws.Cell(headerRow, 3).Value = "Periodo de desvinculación";
            ws.Cell(headerRow, 4).Value = "Años de permanencia";

            var header = ws.Range(headerRow, 1, headerRow, 4);
            header.Style.Fill.BackgroundColor = XLColor.FromHtml(Azul);
            header.Style.Font.FontColor = XLColor.White;
            header.Style.Font.Bold = true;
            header.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            header.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            header.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

            // Data
            var r = headerRow + 1;
            foreach (var row in rows)
            {
                ws.Cell(r, 1).Value = row.NombreCompleto;
                ws.Cell(r, 2).Value = row.PeriodoIngreso;
                ws.Cell(r, 3).Value = string.IsNullOrWhiteSpace(row.PeriodoDesvinculacion) ? "—" : row.PeriodoDesvinculacion;
                ws.Cell(r, 4).Value = row.AniosPermanencia;

                ws.Range(r, 1, r, 4).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                ws.Range(r, 1, r, 4).Style.Border.InsideBorder = XLBorderStyleValues.Thin;

                r++;
            }

            ws.Columns().AdjustToContents();

            using var ms = new MemoryStream();
            wb.SaveAs(ms);

            var fileName = $"Docentes_Permanencia4_{Stamp()}.xlsx";
            return Task.FromResult(new ExportFileResult(ms.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName));
        }

        public Task<ExportFileResult> GenerarPdfAsync(
    Permanencia4MetaDto meta,
    IReadOnlyList<Permanencia4RowDto> rows,
    CancellationToken ct)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var bytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(20);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // Top bar: fecha izq (igual que Nómina)
                    page.Header().Row(r =>
                    {
                        r.RelativeItem().Text(DateTime.Now.ToString("dd/MM/yy, HH:mm"));
                        r.RelativeItem().Text("");
                    });

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);

                        // Título centrado
                        col.Item().AlignCenter()
                            .Text("DOCENTES CON MÁS DE 4 AÑOS DE PERMANENCIA")
                            .FontSize(16).SemiBold();

                        // Solo Total registros (sin Escuela)
                        col.Item().Text(t =>
                        {
                            t.Span("Total registros: ").SemiBold();
                            t.Span((meta?.TotalRegistros ?? rows.Count).ToString());
                        });

                        // Tabla (misma estética)
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(4);     // Nombre
                                c.RelativeColumn(2);     // Ingreso
                                c.RelativeColumn(2.5f);  // Desv
                                c.RelativeColumn(1.5f);  // Años
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(HeadCell).Text("Nombre del docente");
                                h.Cell().Element(HeadCell).AlignCenter().Text("Periodo de\n ingreso");
                                h.Cell().Element(HeadCell).AlignCenter().Text("Periodo de\n desvinculación");
                                h.Cell().Element(HeadCell).AlignCenter().Text("Años de\n permanencia");
                            });

                            // Zebra opcional (como Excel), si no la querés, quitá el Background del BodyCell.
                            var i = 0;
                            foreach (var r in rows)
                            {
                                var alt = (i % 2 == 1);

                                table.Cell().Element(x => BodyCell(x, alt))
                                    .Text(r.NombreCompleto ?? "");

                                table.Cell().Element(x => BodyCell(x, alt))
                                    .AlignCenter()
                                    .Text(string.IsNullOrWhiteSpace(r.PeriodoIngreso) ? "—" : r.PeriodoIngreso);

                                table.Cell().Element(x => BodyCell(x, alt))
                                    .AlignCenter()
                                    .Text(string.IsNullOrWhiteSpace(r.PeriodoDesvinculacion) ? "—" : r.PeriodoDesvinculacion);

                                table.Cell().Element(x => BodyCell(x, alt))
                                    .AlignCenter()
                                    .Text(r.AniosPermanencia.ToString());

                                i++;
                            }

                            
                            static IContainer HeadCell(IContainer x) =>
                                x.Border(1)
                                 .Padding(5)
                                 .Background(Colors.Grey.Lighten3)
                                 .DefaultTextStyle(t => t.SemiBold());

                            static IContainer BodyCell(IContainer x, bool alt) =>
                                x.Border(1)
                                 .Padding(5);
                                
                        });
                    });

                    
                    page.Footer().AlignRight().Text(t =>
                    {
                        t.CurrentPageNumber();
                        t.Span("/");
                        t.TotalPages();
                    });
                });
            }).GeneratePdf();

            var fileName = $"Docentes_Permanencia4_{Stamp()}.pdf";
            return Task.FromResult(new ExportFileResult(bytes, "application/pdf", fileName));
        }

    }
}
