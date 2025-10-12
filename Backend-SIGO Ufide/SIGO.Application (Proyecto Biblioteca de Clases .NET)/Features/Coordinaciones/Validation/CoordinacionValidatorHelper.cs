using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Coordinaciones.Validation;

public static class CoordinacionValidatorHelper
{
    public static async Task<List<string>> ValidateCreateAsync(
        IApplicationDbContext db,
        int personaId, int? carreraId, int periodoId,
        List<int>? cursoIds,
        CancellationToken ct)
    {
        var errors = new List<string>();

        if (!await db.Personas.AnyAsync(x => x.Id == personaId, ct))
            errors.Add("La persona (coordinador) no existe.");

        if (carreraId.HasValue && !await db.Carreras.AnyAsync(x => x.CarreraId == carreraId.Value, ct))
            errors.Add("La carrera especificada no existe.");

        if (!await db.Periodos.AnyAsync(x => x.PeriodoId == periodoId, ct))
            errors.Add("El período especificado no existe.");

        if (cursoIds is { Count: > 0 })
        {
            var set = cursoIds.ToHashSet();
            if (set.Count != cursoIds.Count)
                errors.Add("La lista de cursos contiene duplicados.");

            var existentes = await db.Cursos
                .Where(c => set.Contains(c.CursoId))
                .Select(c => c.CursoId)
                .ToListAsync(ct);

            var faltantes = set.Except(existentes).ToList();
            if (faltantes.Count > 0)
                errors.Add($"Los siguientes cursos no existen: {string.Join(", ", faltantes)}");
        }

        return errors;
    }

    public static async Task<List<string>> ValidateUpdateAsync(
        IApplicationDbContext db,
        int personaId, int? carreraId, int periodoId,
        List<int>? cursoIds,
        CancellationToken ct)
    {
        return await ValidateCreateAsync(db, personaId, carreraId, periodoId, cursoIds, ct);
    }
}
