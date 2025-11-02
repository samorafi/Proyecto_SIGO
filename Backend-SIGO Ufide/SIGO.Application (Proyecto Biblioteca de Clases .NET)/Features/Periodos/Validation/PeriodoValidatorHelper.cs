using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Periodos.Validation;

public static class PeriodoValidatorHelper
{
    private static bool TryParseTipo(string? tipo, out PeriodoTipo tipoEnum, out string? error)
    {
        tipoEnum = PeriodoTipo.Cuatrimestre;
        error = null;

        if (string.IsNullOrWhiteSpace(tipo))
        {
            error = "El tipo de periodo es obligatorio. Use 'C' (Cuatrimestre), 'T' (Trimestre) o 'P' (Mensual).";
            return false;
        }

        switch (tipo.Trim().ToUpperInvariant())
        {
            case "C": tipoEnum = PeriodoTipo.Cuatrimestre; return true;
            case "T": tipoEnum = PeriodoTipo.Trimestre; return true;
            case "P": tipoEnum = PeriodoTipo.Mensual; return true;
            default:
                error = "Tipo inválido. Use 'C' (Cuatrimestre), 'T' (Trimestre) o 'P' (Mensual).";
                return false;
        }
    }

    private static (int Min, int Max) RangoPorTipo(PeriodoTipo tipo)
        => tipo == PeriodoTipo.Cuatrimestre ? (1, 3)
         : tipo == PeriodoTipo.Trimestre ? (1, 4)
         : (1, 12);

    public static List<string> ValidateBasics(int anio, int numero, string? tipo)
    {
        var errors = new List<string>();

        if (anio <= 0)
            errors.Add("El año debe ser mayor a 0.");

        if (!TryParseTipo(tipo, out var tipoEnum, out var tipoErr))
        {
            errors.Add(tipoErr!);
            return errors;
        }

        var (min, max) = RangoPorTipo(tipoEnum);
        if (numero < min || numero > max)
            errors.Add($"El número de periodo debe estar entre {min} y {max} para el tipo '{tipo?.Trim().ToUpperInvariant()}'.");
        return errors;
    }

    public static async Task<List<string>> ValidateCreateAsync(
        IApplicationDbContext db, int anio, int numero, string? tipo, CancellationToken ct)
    {
        var errors = ValidateBasics(anio, numero, tipo);
        if (!TryParseTipo(tipo, out var tipoEnum, out _))
            return errors;

        var exists = await db.Periodos
            .AnyAsync(p => p.Anio == anio && p.Numero == numero && p.Tipo == tipoEnum, ct);

        if (exists)
            errors.Add("Ya existe un periodo con ese año, tipo y número.");
        return errors;
    }

    public static async Task<List<string>> ValidateUpdateAsync(
        IApplicationDbContext db, int periodoId, int anio, int numero, string? tipo, CancellationToken ct)
    {
        var errors = ValidateBasics(anio, numero, tipo);
        if (!TryParseTipo(tipo, out var tipoEnum, out _))
            return errors;

        var exists = await db.Periodos
            .AnyAsync(p => p.Anio == anio && p.Numero == numero && p.Tipo == tipoEnum && p.PeriodoId != periodoId, ct);

        if (exists)
            errors.Add("Ya existe otro periodo con ese año, tipo y número.");
        return errors;
    }
}
