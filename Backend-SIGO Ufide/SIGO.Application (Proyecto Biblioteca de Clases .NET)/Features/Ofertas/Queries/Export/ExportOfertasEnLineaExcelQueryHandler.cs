using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClosedXML.Excel;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Ofertas.Queries.Export;

public sealed class ExportOfertasEnLineaExcelQueryHandler
    : IRequestHandler<ExportOfertasEnLineaExcelQuery, byte[]>
{
    private readonly IApplicationDbContext _db;

    public ExportOfertasEnLineaExcelQueryHandler(IApplicationDbContext db)
        => _db = db;

    public async Task<byte[]> Handle(ExportOfertasEnLineaExcelQuery request, CancellationToken ct)
    {
        if (request.PeriodoId <= 0)
            throw new ArgumentException("Debe indicar un PeriodoId válido para exportar.");

        // Etiqueta del periodo
        var periodoEtiqueta = await _db.Periodos
            .AsNoTracking()
            .Where(p => p.PeriodoId == request.PeriodoId)
            .Select(p => p.Etiqueta)
            .FirstOrDefaultAsync(ct);

        if (string.IsNullOrWhiteSpace(periodoEtiqueta))
            throw new ArgumentException("El período indicado no existe.");

        // Data 100% virtual (ModalidadId == 3)
        var data = await _db.Ofertas
            .AsNoTracking()
            .Where(o => o.Archivados == false)
            .Where(o => o.PeriodoId == request.PeriodoId)
            .Where(o => o.ModalidadId == 3)
            .OrderByDescending(o => o.OfertaId)
            .Select(o => new
            {
                Grado = o.Curso != null && o.Curso.Grado != null ? o.Curso.Grado.Nombre : null,         // A
                Carrera = o.Curso != null && o.Curso.Carrera != null ? o.Curso.Carrera.Nombre : null,   // B
                Sede = o.Sede != null ? o.Sede.Nombre : null,                                             // C
                Periodo = o.Periodo != null ? o.Periodo.Etiqueta : null,                                  // D
                Codigo = o.Curso != null ? o.Curso.Codigo : null,                                          // E
                Materia = o.Curso != null ? o.Curso.Nombre : null,                                         // F
                Grupo = o.Grupo,                                                                           // G
                Dia = o.Horario != null && !string.IsNullOrEmpty(o.Horario.Dia)
                    ? o.Horario.Dia.Substring(0, 1)
                    : null,                                                                                // H
                Horario = o.Horario != null ? o.Horario.Rango : null,                                      // I
                Matricula = o.Matriculados,                                                                // J
                Accion = o.Accion != null ? o.Accion.Nombre : null,                                        // K
                ProfesorNombre = o.Persona != null
                    ? ((o.Persona.Nombre ?? "") + " " +
                       (o.Persona.PrimerApellido ?? "") + " " +
                       (o.Persona.SegundoApellido ?? "")).Trim()
                    : null,                                                                                // L
                ProfesorCorreo = o.Persona != null ? o.Persona.Correo : null,                              // M
                ProfesorCelular = o.Persona != null ? o.Persona.Telefono : null,                           // N
                CoordinadorNombre = o.Coordinador != null
                    ? ((o.Coordinador.Nombre ?? "") + " " +
                       (o.Coordinador.PrimerApellido ?? "") + " " +
                       (o.Coordinador.SegundoApellido ?? "")).Trim()
                    : null,                                                                                // O
                CoordinadorCorreo = o.Coordinador != null ? o.Coordinador.Correo : null,                   // P
                CuatrimestreIngreso = o.Persona != null && o.Persona.PeriodoIngreso != null
                    ? o.Persona.PeriodoIngreso.EtiquetaRuntime
                    : null                                                                                  // Q
            })
            .ToListAsync(ct);

        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Ofertas En Línea");

        const int colCount = 17;  // A-Q
        const int headerRow = 3;
        const int startRow = 4;

        // Anchos aproximados
        double[] widths =
        {
            14, 18, 16, 14, 10, 28, 6, 6, 12, 10, 12, 28, 24, 14, 26, 24, 20
        };
        for (int i = 0; i < colCount; i++)
            ws.Column(i + 1).Width = widths[i];

        // Título azul (fila 1)
        ws.Range(1, 1, 1, colCount).Merge();
        ws.Cell(1, 1).Value = "Universidad Fidélitas - Facultad de Ciencias de la Computación";
        ws.Range(1, 1, 1, colCount).Style
            .Font.SetBold()
            .Font.SetFontColor(XLColor.White)
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#0B2F8A"));
        ws.Row(1).Height = 22;

        // Subtítulo azul (fila 2) con etiqueta
        ws.Range(2, 1, 2, colCount).Merge();
        ws.Cell(2, 1).Value = $"Oferta Académica En Línea | {periodoEtiqueta}";
        ws.Range(2, 1, 2, colCount).Style
            .Font.SetBold()
            .Font.SetFontColor(XLColor.White)
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Right)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#0B2F8A"));
        ws.Row(2).Height = 18;

        // Encabezados amarillos (fila 3)
        string[] headers =
        {
            "Grado","Carrera","Sede","Periodo","Código","Materia","Gru","Día","Horario","Matríc","Acción",
            "Profesor","Correo","Celular","Coordinador","Correo","Cuatrimestre de Ingreso"
        };

        for (int c = 1; c <= colCount; c++)
        {
            ws.Cell(headerRow, c).Value = headers[c - 1];
            ws.Cell(headerRow, c).Style
                .Font.SetBold()
                .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
                .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
                .Fill.SetBackgroundColor(XLColor.FromHtml("#FFC000"))
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
                .Border.SetInsideBorder(XLBorderStyleValues.Thin);
        }
        ws.Row(headerRow).Height = 18;

        // Helpers tipo seguro
        static void SetText(IXLCell cell, string? value)
        {
            cell.Style.NumberFormat.Format = "@";
            cell.Value = value ?? "";
        }

        static void SetInt(IXLCell cell, int? value)
        {
            cell.Style.NumberFormat.Format = "0";
            cell.Value = value ?? 0;
        }

        // Datos
        int row = startRow;
        foreach (var r in data)
        {
            var rng = ws.Range(row, 1, row, colCount);
            rng.Style.Border.SetOutsideBorder(XLBorderStyleValues.Thin);
            rng.Style.Border.SetInsideBorder(XLBorderStyleValues.Thin);
            rng.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Center);

            SetText(ws.Cell(row, 1), r.Grado);
            SetText(ws.Cell(row, 2), r.Carrera);
            SetText(ws.Cell(row, 3), r.Sede);
            SetText(ws.Cell(row, 4), r.Periodo);

            SetText(ws.Cell(row, 5), r.Codigo);
            SetText(ws.Cell(row, 6), r.Materia);

            SetInt(ws.Cell(row, 7), r.Grupo);

            SetText(ws.Cell(row, 8), r.Dia);
            SetText(ws.Cell(row, 9), r.Horario);

            SetInt(ws.Cell(row, 10), r.Matricula);

            SetText(ws.Cell(row, 11), r.Accion);
            SetText(ws.Cell(row, 12), r.ProfesorNombre);
            SetText(ws.Cell(row, 13), r.ProfesorCorreo);
            SetText(ws.Cell(row, 14), r.ProfesorCelular);
            SetText(ws.Cell(row, 15), r.CoordinadorNombre);
            SetText(ws.Cell(row, 16), r.CoordinadorCorreo);
            SetText(ws.Cell(row, 17), r.CuatrimestreIngreso);

            row++;
        }

        int lastRow = Math.Max(startRow, row - 1);

        // AutoFilter
        ws.Range(headerRow, 1, lastRow, colCount).SetAutoFilter();
        ws.SheetView.FreezeRows(3);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }
}