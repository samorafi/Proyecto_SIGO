using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Carreras.Validation;

public static class CarreraValidatorHelper
{
    public static async Task<List<string>> ValidateCreateAsync(
        IApplicationDbContext db, string nombre, CancellationToken ct)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(nombre)) errors.Add("El nombre es obligatorio.");

        if (!string.IsNullOrWhiteSpace(nombre) &&
            await db.Carreras.AnyAsync(c => c.Nombre == nombre.Trim(), ct))
            errors.Add("Ya existe una carrera con ese nombre.");

        return errors;
    }

    public static async Task<List<string>> ValidateUpdateAsync(
        IApplicationDbContext db, int id, string nombre, CancellationToken ct)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(nombre)) errors.Add("El nombre es obligatorio.");

        if (!string.IsNullOrWhiteSpace(nombre) &&
            await db.Carreras.AnyAsync(c => c.Nombre == nombre.Trim() && c.CarreraId != id, ct))
            errors.Add("Ya existe otra carrera con ese nombre.");

        return errors;
    }
}
