using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Coordinaciones.Dto;

namespace SIGO.Application.Features.Coordinaciones.Queries;

public sealed class GetCoordinacionByIdQueryHandler
    : IRequestHandler<GetCoordinacionByIdQuery, CoordinacionResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetCoordinacionByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<CoordinacionResponseDto?> Handle(GetCoordinacionByIdQuery request, CancellationToken ct)
    {
        var dto = await _db.Coordinaciones.AsNoTracking()
            .Where(c => c.CoordinacionId == request.Id)
            .Select(c => new CoordinacionResponseDto
            {
                CoordinacionId = c.CoordinacionId,
                PersonaId = c.PersonaId,
                CarreraId = c.CarreraId,
                PeriodoId = c.PeriodoId,
                Estado = c.Estado,
                Comentarios = c.Comentarios,
                CursoIds = new List<int>()
            })
            .FirstOrDefaultAsync(ct);

        if (dto is null) return null;

        dto.CursoIds = await _db.CoordinacionesCursos.AsNoTracking()
            .Where(x => x.CoordinacionId == dto.CoordinacionId)
            .Select(x => x.CursoId)
            .ToListAsync(ct);

        return dto;
    }
}
