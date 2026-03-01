using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Cursos.Validation;

public static class CursoValidatorHelper
{
    public static async Task<List<string>> ValidateCreateAsync(
        IApplicationDbContext db, string codigo, string nombre, int? carreraId, int? gradoId, CancellationToken ct)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(codigo)) errors.Add("El código es obligatorio.");
        if (string.IsNullOrWhiteSpace(nombre)) errors.Add("El nombre es obligatorio.");

        // Duplicado por código (UNIQUE)
        if (!string.IsNullOrWhiteSpace(codigo) &&
            await db.Cursos.AnyAsync(c => c.Codigo == codigo, ct))
            errors.Add("Ya existe un curso con el mismo código.");

        // FKs adicionales
        if (carreraId.HasValue && !await db.Carreras.AnyAsync(x => x.CarreraId == carreraId.Value, ct))
            errors.Add("La carrera especificada no existe.");
        if (gradoId.HasValue && !await db.Grados.AnyAsync(x => x.GradoId == gradoId.Value, ct))
            errors.Add("El grado especificado no existe.");

        return errors;
    }

    public static async Task<List<string>> ValidateUpdateAsync(
        IApplicationDbContext db, int id, string codigo, string nombre, int? carreraId, int? gradoId, CancellationToken ct)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(codigo)) errors.Add("El código es obligatorio.");
        if (string.IsNullOrWhiteSpace(nombre)) errors.Add("El nombre es obligatorio.");

        // Duplicado por código excluyendo el propio
        if (!string.IsNullOrWhiteSpace(codigo) &&
            await db.Cursos.AnyAsync(c => c.Codigo == codigo && c.CursoId != id, ct))
            errors.Add("Ya existe otro curso con el mismo código.");

        if (carreraId.HasValue && !await db.Carreras.AnyAsync(x => x.CarreraId == carreraId.Value, ct))
            errors.Add("La carrera especificada no existe.");
        if (gradoId.HasValue && !await db.Grados.AnyAsync(x => x.GradoId == gradoId.Value, ct))
            errors.Add("El grado especificado no existe.");

        return errors;
    }
}
