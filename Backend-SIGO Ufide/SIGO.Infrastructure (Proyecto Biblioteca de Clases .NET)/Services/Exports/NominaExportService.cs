using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Dto;
using SIGO.Application.Features.Nomina.Dto;

namespace SIGO.Infrastructure.Services.Exports
{
    public class NominaExportService : INominaExportService
    {
        public ExportFileDto ExportarExcel(NominaDocenteMetaDto meta, List<NominaDocenteRowDto> rows, string fileName)
        {
            // Contadores
            var activos = rows.Count(x => (x.Estado ?? "").Trim().Equals("Activo", StringComparison.OrdinalIgnoreCase));
            var inactivos = rows.Count - activos;

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Nomina");

            // Ajuste columnas (similar a tu tabla)
            ws.Column(1).Width = 45; // Nombre
            ws.Column(2).Width = 18; // Ingreso
            ws.Column(3).Width = 22; // Desv
            ws.Column(4).Width = 14; // Estado
            ws.Column(5).Width = 28; // Motivo

            int row = 1;

            // Encabezado
            ws.Range(row, 1, row, 5).Merge().Value = "NÓMINA DOCENTE";
            ws.Range(row, 1, row, 5).Style.Font.Bold = true;
            ws.Range(row, 1, row, 5).Style.Font.FontSize = 16;
            ws.Range(row, 1, row, 5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            row += 2;

            // Meta izquierda
            ws.Cell(row, 1).Value = "Escuela:";
            ws.Cell(row, 1).Style.Font.Bold = true;
            ws.Cell(row, 2).Value = meta.Escuela;

            ws.Cell(row, 4).Value = "Sede:";
            ws.Cell(row, 4).Style.Font.Bold = true;
            ws.Cell(row, 5).Value = string.IsNullOrWhiteSpace(meta.Sede) ? "Todas" : meta.Sede;
            row++;

            ws.Cell(row, 1).Value = "Dirección:";
            ws.Cell(row, 1).Style.Font.Bold = true;
            ws.Cell(row, 2).Value = meta.Direccion;

            ws.Cell(row, 4).Value = "Periodo:";
            ws.Cell(row, 4).Style.Font.Bold = true;
            ws.Cell(row, 5).Value = meta.Periodo ?? "";
            row++;

            ws.Cell(row, 1).Value = "Subdirección:";
            ws.Cell(row, 1).Style.Font.Bold = true;
            ws.Cell(row, 2).Value = meta.Subdireccion;

            ws.Cell(row, 4).Value = "Cant. Docentes activos:";
            ws.Cell(row, 4).Style.Font.Bold = true;
            ws.Cell(row, 5).Value = activos;
            row++;

            ws.Cell(row, 1).Value = "Coordinación:";
            ws.Cell(row, 1).Style.Font.Bold = true;
            ws.Cell(row, 2).Value = meta.Coordinacion;

            ws.Cell(row, 4).Value = "Cant. Docentes inactivos:";
            ws.Cell(row, 4).Style.Font.Bold = true;
            ws.Cell(row, 5).Value = inactivos;
            row += 2;

            // Header tabla
            int headerRow = row;
            ws.Cell(headerRow, 1).Value = "Nombre del docente";
            ws.Cell(headerRow, 2).Value = "Periodo de ingreso";
            ws.Cell(headerRow, 3).Value = "Periodo de desvinculación";
            ws.Cell(headerRow, 4).Value = "Estado actual";
            ws.Cell(headerRow, 5).Value = "Motivo de desvinculación";

            var headerRange = ws.Range(headerRow, 1, headerRow, 5);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Font.FontColor = XLColor.White;
            headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#2B338C");
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

            // Data
            int dataRow = headerRow + 1;
            foreach (var r in rows)
            {
                ws.Cell(dataRow, 1).Value = r.NombreCompleto;
                ws.Cell(dataRow, 2).Value = string.IsNullOrWhiteSpace(r.PeriodoIngreso) ? "—" : r.PeriodoIngreso;
                ws.Cell(dataRow, 3).Value = string.IsNullOrWhiteSpace(r.PeriodoDesvinculacion) ? "—" : r.PeriodoDesvinculacion;
                ws.Cell(dataRow, 4).Value = string.IsNullOrWhiteSpace(r.Estado) ? "—" : r.Estado;
                ws.Cell(dataRow, 5).Value = string.IsNullOrWhiteSpace(r.MotivoDesvinculacion) ? "—" : r.MotivoDesvinculacion;

                dataRow++;
            }

            // Bordes + zebra
            var tableRange = ws.Range(headerRow, 1, dataRow - 1, 5);
            tableRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            tableRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

            for (int i = headerRow + 1; i <= dataRow - 1; i++)
            {
                if ((i - (headerRow + 1)) % 2 == 1)
                    ws.Range(i, 1, i, 5).Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F4F6");
            }

            ws.SheetView.FreezeRows(headerRow);

            using var ms = new MemoryStream();
            wb.SaveAs(ms);

            return new ExportFileDto
            {
                Content = ms.ToArray(),
                ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                FileName = fileName
            };
        }

        public ExportFileDto ExportarPdf(NominaDocenteMetaDto meta, List<NominaDocenteRowDto> rows, string fileName)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var activos = rows.Count(x => (x.Estado ?? "").Trim().Equals("Activo", StringComparison.OrdinalIgnoreCase));
            var inactivos = rows.Count - activos;

            var bytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(20);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // Top bar: fecha izq + titulo centro
                    page.Header().Row(r =>
                    {
                        r.RelativeItem().Text(DateTime.Now.ToString("dd/MM/yy, HH:mm"));
                        r.RelativeItem().Text("");
                    });

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().AlignCenter().Text("NÓMINA DOCENTE").FontSize(16).SemiBold();

                        // Meta: izquierda y derecha
                        col.Item().Row(r =>
                        {
                            r.RelativeItem(2).Column(left =>
                            {
                                left.Item().Text(t => { t.Span("Escuela: ").SemiBold(); t.Span(meta.Escuela ?? ""); });
                                left.Item().Text(t => { t.Span("Dirección: ").SemiBold(); t.Span(meta.Direccion ?? ""); });
                                left.Item().Text(t => { t.Span("Subdirección: ").SemiBold(); t.Span(meta.Subdireccion ?? ""); });
                                left.Item().Text(t => { t.Span("Coordinación: ").SemiBold(); t.Span(meta.Coordinacion ?? ""); });
                            });

                            r.RelativeItem(1).AlignRight().Column(right =>
                            {
                                right.Item().Text(t => { t.Span("Sede: ").SemiBold(); t.Span(string.IsNullOrWhiteSpace(meta.Sede) ? "Todas" : meta.Sede); });
                                right.Item().Text(t => { t.Span("Periodo: ").SemiBold(); t.Span(meta.Periodo ?? ""); });
                                right.Item().Text(t => { t.Span("Cant. Docentes activos: ").SemiBold(); t.Span(activos.ToString()); });
                                right.Item().Text(t => { t.Span("Cant. Docentes inactivos: ").SemiBold(); t.Span(inactivos.ToString()); });
                            });
                        });

                        // Tabla
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(4); // Nombre
                                c.RelativeColumn(2); // Ingreso
                                c.RelativeColumn(2); // Desv
                                c.RelativeColumn(1.5f); // Estado
                                c.RelativeColumn(3); // Motivo
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(HeadCell).Text("Nombre del docente");
                                h.Cell().Element(HeadCell).AlignCenter().Text("Periodo de\n ingreso");
                                h.Cell().Element(HeadCell).AlignCenter().Text("Periodo de\n desvinculación");
                                h.Cell().Element(HeadCell).AlignCenter().Text("Estado\n actual");
                                h.Cell().Element(HeadCell).AlignCenter().Text("Motivo de\n desvinculación");
                            });

                            foreach (var r in rows)
                            {
                                table.Cell().Element(BodyCell).Text(r.NombreCompleto);
                                table.Cell().Element(BodyCell).AlignCenter().Text(string.IsNullOrWhiteSpace(r.PeriodoIngreso) ? "—" : r.PeriodoIngreso);
                                table.Cell().Element(BodyCell).AlignCenter().Text(string.IsNullOrWhiteSpace(r.PeriodoDesvinculacion) ? "—" : r.PeriodoDesvinculacion);
                                table.Cell().Element(BodyCell).AlignCenter().Text(string.IsNullOrWhiteSpace(r.Estado) ? "—" : r.Estado);
                                table.Cell().Element(BodyCell).Text(string.IsNullOrWhiteSpace(r.MotivoDesvinculacion) ? "—" : r.MotivoDesvinculacion);
                            }

                            static IContainer HeadCell(IContainer x) =>
                                x.Border(1).Padding(5).Background(Colors.Grey.Lighten3).DefaultTextStyle(t => t.SemiBold());

                            static IContainer BodyCell(IContainer x) =>
                                x.Border(1).Padding(5);
                        });
                    });

                    // Footer: paginación derecha (1/10)
                    page.Footer().AlignRight().Text(t =>
                    {
                        t.CurrentPageNumber();
                        t.Span("/");
                        t.TotalPages();
                    });
                });
            }).GeneratePdf();

            return new ExportFileDto
            {
                Content = bytes,
                ContentType = "application/pdf",
                FileName = fileName
            };
        }
    }
}
