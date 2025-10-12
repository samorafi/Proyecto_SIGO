using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Coordinaciones.Dto;
using SIGO.Application.Features.Coordinaciones.Validation;

namespace SIGO.Application.Features.Coordinaciones.Commands.Update;

public sealed class UpdateCoordinacionCommandHandler
    : IRequestHandler<UpdateCoordinacionCommand, CoordinacionResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public UpdateCoordinacionCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CoordinacionResponseDto?> Handle(UpdateCoordinacionCommand request, CancellationToken ct)
    {
        var id = request.Id;
        var r = request.Data;

        var entity = await _db.Coordinaciones
            .Include(c => c.Cursos)
            .FirstOrDefaultAsync(c => c.CoordinacionId == id, ct);

        if (entity is null) return null;

        var errors = await CoordinacionValidatorHelper.ValidateUpdateAsync(
            _db, r.PersonaId, r.CarreraId, r.PeriodoId, r.CursoIds, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        entity.PersonaId = r.PersonaId;
        entity.CarreraId = r.CarreraId;
        entity.PeriodoId = r.PeriodoId;
        entity.Estado = r.Estado;
        entity.Comentarios = r.Comentarios;

        // Reemplazo de cursos solo si se envía la lista (null = no tocar)
        if (r.CursoIds is not null)
        {
            // eliminar actuales
            if (entity.Cursos.Count > 0)
                _db.CoordinacionesCursos.RemoveRange(entity.Cursos);

            // agregar nuevos (distintos)
            foreach (var cid in r.CursoIds.Distinct())
                _db.CoordinacionesCursos.Add(new Domain.Entities.CoordinacionCurso
                {
                    CoordinacionId = entity.CoordinacionId,
                    CursoId = cid,
                    Estado = true
                });
        }

        await _db.SaveChangesAsync(ct);

        return new CoordinacionResponseDto
        {
            CoordinacionId = entity.CoordinacionId,
            PersonaId = entity.PersonaId,
            CarreraId = entity.CarreraId,
            PeriodoId = entity.PeriodoId,
            Estado = entity.Estado,
            Comentarios = entity.Comentarios,
            CursoIds = r.CursoIds is not null
                ? r.CursoIds.Distinct().ToList()
                : await _db.CoordinacionesCursos
                    .Where(x => x.CoordinacionId == entity.CoordinacionId)
                    .Select(x => x.CursoId)
                    .ToListAsync(ct)
        };
    }
}
