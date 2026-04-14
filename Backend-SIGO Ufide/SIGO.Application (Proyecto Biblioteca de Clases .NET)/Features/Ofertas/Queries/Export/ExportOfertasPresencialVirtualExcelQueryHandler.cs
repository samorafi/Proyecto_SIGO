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

public sealed class ExportOfertasPresencialVirtualExcelQueryHandler
    : IRequestHandler<ExportOfertasPresencialVirtualExcelQuery, byte[]>
{
    private readonly IApplicationDbContext _db;

    public ExportOfertasPresencialVirtualExcelQueryHandler(IApplicationDbContext db)
        => _db = db;

    public async Task<byte[]> Handle(ExportOfertasPresencialVirtualExcelQuery request, CancellationToken ct)
    {
        if (request.PeriodoId <= 0)
            throw new ArgumentException("Debe indicar un PeriodoId válido para exportar.");

        var data = await _db.Ofertas
            .AsNoTracking()
            .Where(o => o.Archivados == false)
            .Where(o => o.PeriodoId == request.PeriodoId)
            .Where(o => o.ModalidadId == 1 || o.ModalidadId == 2) // Presencial + Virtual
            .OrderByDescending(o => o.OfertaId)
            .Select(o => new
            {
                Grado = o.Curso != null && o.Curso.Grado != null ? o.Curso.Grado.Nombre : null,
                Carrera = o.Curso != null && o.Curso.Carrera != null ? o.Curso.Carrera.Nombre : null,
                Sede = o.Sede != null ? o.Sede.Nombre : null,
                PeriodoEtiqueta = o.Periodo != null ? o.Periodo.Etiqueta : null,
                Codigo = o.Curso != null ? o.Curso.Codigo : null,
                Materia = o.Curso != null ? o.Curso.Nombre : null,
                Grupo = o.Grupo,
                Dia = o.Horario != null && !string.IsNullOrEmpty(o.Horario.Dia)
                    ? o.Horario.Dia.Substring(0, 1)
                    : null,
                Horario = o.Horario != null ? o.Horario.Rango : null,
                Matricula = o.Matriculados,
                Accion = o.Accion != null ? o.Accion.Nombre : null,
                ProfesorNombre = o.Persona != null
                    ? ((o.Persona.Nombre ?? "") + " " +
                       (o.Persona.PrimerApellido ?? "") + " " +
                       (o.Persona.SegundoApellido ?? "")).Trim()
                    : null,
                ProfesorCorreo = o.Persona != null ? o.Persona.Correo : null,
                ProfesorCelular = o.Persona != null ? o.Persona.Telefono : null,
                CoordinadorNombre = o.Coordinador != null
                    ? ((o.Coordinador.Nombre ?? "") + " " +
                       (o.Coordinador.PrimerApellido ?? "") + " " +
                       (o.Coordinador.SegundoApellido ?? "")).Trim()
                    : null,
                CoordinadorCorreo = o.Coordinador != null ? o.Coordinador.Correo : null,
                CuatrimestreIngreso = o.Persona != null && o.Persona.PeriodoIngreso != null
                    ? o.Persona.PeriodoIngreso.EtiquetaRuntime
                    : null
            })
            .ToListAsync(ct);

        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Ofertas");

        // ====== Layout (similar al template) ======
        const int colCount = 17; // A-Q

        // Anchos aproximados (ajustables)
        double[] widths =
        {
            14, 18, 16, 8, 10, 28, 6, 6, 12, 10, 12, 28, 24, 14, 26, 24, 18
        };
        for (int i = 0; i < colCount; i++)
            ws.Column(i + 1).Width = widths[i];

        // Título (fila 1) - barra azul
        ws.Range(1, 1, 1, colCount).Merge();
        ws.Cell(1, 1).Value = "Universidad Fidélitas - Facultad de Ciencias de la Computación";
        ws.Range(1, 1, 1, colCount).Style
            .Font.SetBold()
            .Font.SetFontColor(XLColor.White)
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#0B2F8A"));
        ws.Row(1).Height = 22;

        // Subtítulo (fila 2)
        ws.Range(2, 1, 2, colCount).Merge();
        ws.Cell(2, 1).Value = $"Oferta Académica | Período {request.PeriodoId}";
        ws.Range(2, 1, 2, colCount).Style
            .Font.SetBold()
            .Font.SetFontColor(XLColor.White)
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Right)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#0B2F8A"));
        ws.Row(2).Height = 18;

        // Encabezados (fila 3) - amarillo
        const int headerRow = 3;
        const int startRow = 4;

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
                .Font.SetFontColor(XLColor.Black)
                .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
                .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
                .Fill.SetBackgroundColor(XLColor.FromHtml("#FFC000"))
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
                .Border.SetInsideBorder(XLBorderStyleValues.Thin);
        }
        ws.Row(headerRow).Height = 18;

        // Helpers para forzar tipos
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

        // ====== Data ======
        int row = startRow;
        foreach (var r in data)
        {
            // Bordes para toda la fila A-Q
            var rng = ws.Range(row, 1, row, colCount);
            rng.Style.Border.SetOutsideBorder(XLBorderStyleValues.Thin);
            rng.Style.Border.SetInsideBorder(XLBorderStyleValues.Thin);
            rng.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Center);

            // A-Q
            SetText(ws.Cell(row, 1), r.Grado);
            SetText(ws.Cell(row, 2), r.Carrera);
            SetText(ws.Cell(row, 3), r.Sede);
            SetText(ws.Cell(row, 4), r.PeriodoEtiqueta);

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

        // AutoFilter desde encabezado hasta última fila
        ws.Range(headerRow, 1, lastRow, colCount).SetAutoFilter();

        // Congelar encabezados (opcional pero útil)
        ws.SheetView.FreezeRows(3);

        // Export bytes
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }
}