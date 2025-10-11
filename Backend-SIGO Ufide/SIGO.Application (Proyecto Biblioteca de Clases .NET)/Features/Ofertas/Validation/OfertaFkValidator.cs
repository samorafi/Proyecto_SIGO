using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Ofertas.Validation;

public static class OfertaFkValidator
{
    public static async Task<List<string>> ValidateCreateAsync(
        IApplicationDbContext db,
        int cursoId, int sedeId, int modalidadId, int horarioId, int periodoId,
        int accionId, int? coordinadorId,
        CancellationToken ct)
    {
        var errors = new List<string>();

        if (!await db.Cursos.AnyAsync(x => x.CursoId == cursoId, ct)) errors.Add("El curso especificado no existe.");
        if (!await db.Sedes.AnyAsync(x => x.SedeId == sedeId, ct)) errors.Add("La sede especificada no existe.");
        if (!await db.Modalidades.AnyAsync(x => x.ModalidadId == modalidadId, ct)) errors.Add("La modalidad especificada no existe.");
        if (!await db.Horarios.AnyAsync(x => x.HorarioId == horarioId, ct)) errors.Add("El horario especificado no existe.");
        if (!await db.Periodos.AnyAsync(x => x.PeriodoId == periodoId, ct)) errors.Add("El período especificado no existe.");
        if (!await db.AccionesOferta.AnyAsync(x => x.AccionId == accionId, ct)) errors.Add("La acción especificada no existe.");
        if (coordinadorId.HasValue && !await db.Personas.AnyAsync(x => x.Id == coordinadorId, ct)) errors.Add("El coordinador especificado no existe.");

        return errors;
    }

    public static async Task<List<string>> ValidateUpdateAsync(
        IApplicationDbContext db,
        int cursoId, int sedeId, int modalidadId, int horarioId, int periodoId,
        int? accionId, int? coordinadorId,
        CancellationToken ct)
    {
        var errors = new List<string>();

        if (!await db.Cursos.AnyAsync(x => x.CursoId == cursoId, ct)) errors.Add("El curso especificado no existe.");
        if (!await db.Sedes.AnyAsync(x => x.SedeId == sedeId, ct)) errors.Add("La sede especificada no existe.");
        if (!await db.Modalidades.AnyAsync(x => x.ModalidadId == modalidadId, ct)) errors.Add("La modalidad especificada no existe.");
        if (!await db.Horarios.AnyAsync(x => x.HorarioId == horarioId, ct)) errors.Add("El horario especificado no existe.");
        if (!await db.Periodos.AnyAsync(x => x.PeriodoId == periodoId, ct)) errors.Add("El período especificado no existe.");
        if (accionId.HasValue && !await db.AccionesOferta.AnyAsync(x => x.AccionId == accionId, ct)) errors.Add("La acción especificada no existe.");
        if (coordinadorId.HasValue && !await db.Personas.AnyAsync(x => x.Id == coordinadorId, ct)) errors.Add("El coordinador especificado no existe.");

        return errors;
    }
}
