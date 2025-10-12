using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Personas.Dto;

namespace SIGO.Application.Features.Personas.Queries;

public sealed class GetCoordinadoresQueryHandler
    : IRequestHandler<GetCoordinadoresQuery, List<CoordinadorResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetCoordinadoresQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<CoordinadorResponseDto>> Handle(GetCoordinadoresQuery request, CancellationToken ct)
    {
        var coordQ = _db.Coordinaciones.AsNoTracking().Select(c => new { c.PersonaId, c.Estado });

        if (request.SoloActivas)
            coordQ = coordQ.Where(c => c.Estado);

        var personaIds = await coordQ
            .Select(c => c.PersonaId)
            .Distinct()
            .ToListAsync(ct);

        if (personaIds.Count == 0) return new();

        return await _db.Personas.AsNoTracking()
            .Where(p => personaIds.Contains(p.Id))
            .OrderBy(p => p.Nombre)
            .Select(p => new CoordinadorResponseDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Correo = p.Correo
            })
            .ToListAsync(ct);
    }
}
