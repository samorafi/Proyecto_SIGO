using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Coordinaciones.Dto;
using SIGO.Application.Features.Coordinaciones.Validation;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Coordinaciones.Commands.Create;

public sealed class CreateCoordinacionCommandHandler
    : IRequestHandler<CreateCoordinacionCommand, CoordinacionResponseDto>
{
    private readonly IApplicationDbContext _db;
    public CreateCoordinacionCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CoordinacionResponseDto> Handle(CreateCoordinacionCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var errors = await CoordinacionValidatorHelper.ValidateCreateAsync(
            _db, r.PersonaId, r.CarreraId, r.PeriodoId, r.CursoIds, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        var e = new Coordinacion
        {
            PersonaId = r.PersonaId,
            CarreraId = r.CarreraId,
            PeriodoId = r.PeriodoId,
            Estado = r.Estado,
            Comentarios = r.Comentarios
        };

        _db.Coordinaciones.Add(e);

        if (r.CursoIds is { Count: > 0 })
        {
            foreach (var cid in r.CursoIds.Distinct())
                _db.CoordinacionesCursos.Add(new CoordinacionCurso { Coordinacion = e, CursoId = cid, Estado = true });
        }

        await _db.SaveChangesAsync(ct);

        return new CoordinacionResponseDto
        {
            CoordinacionId = e.CoordinacionId,
            PersonaId = e.PersonaId,
            CarreraId = e.CarreraId,
            PeriodoId = e.PeriodoId,
            Estado = e.Estado,
            Comentarios = e.Comentarios,
            CursoIds = r.CursoIds?.Distinct().ToList() ?? new List<int>()
        };
    }
}
