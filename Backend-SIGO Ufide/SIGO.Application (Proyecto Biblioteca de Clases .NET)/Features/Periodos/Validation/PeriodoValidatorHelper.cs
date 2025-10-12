using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Periodos.Validation;

public static class PeriodoValidatorHelper
{
    public static List<string> ValidateBasics(int anio, int numero)
    {
        var errors = new List<string>();
        if (anio <= 0) errors.Add("El año debe ser mayor a 0.");
        if (numero < 1 || numero > 3) errors.Add("El número de periodo debe estar entre 1 y 3.");
        return errors;
    }

    public static async Task<List<string>> ValidateCreateAsync(IApplicationDbContext db, int anio, int numero, CancellationToken ct)
    {
        var errors = ValidateBasics(anio, numero);
        if (await db.Periodos.AnyAsync(p => p.Anio == anio && p.Numero == numero, ct))
            errors.Add("Ya existe un periodo con ese año y número.");
        return errors;
    }

    public static async Task<List<string>> ValidateUpdateAsync(IApplicationDbContext db, int id, int anio, int numero, CancellationToken ct)
    {
        var errors = ValidateBasics(anio, numero);
        if (await db.Periodos.AnyAsync(p => p.Anio == anio && p.Numero == numero && p.PeriodoId != id, ct))
            errors.Add("Ya existe otro periodo con ese año y número.");
        return errors;
    }
}
