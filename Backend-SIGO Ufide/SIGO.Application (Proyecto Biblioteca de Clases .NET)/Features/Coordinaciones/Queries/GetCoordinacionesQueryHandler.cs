using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Coordinaciones.Dto;

namespace SIGO.Application.Features.Coordinaciones.Queries;

public sealed class GetCoordinacionesQueryHandler
    : IRequestHandler<GetCoordinacionesQuery, List<CoordinacionResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetCoordinacionesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<CoordinacionResponseDto>> Handle(GetCoordinacionesQuery request, CancellationToken ct)
    {
        var baseList = await _db.Coordinaciones.AsNoTracking()
            .OrderByDescending(c => c.CoordinacionId)
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
            .ToListAsync(ct);

        if (baseList.Count == 0) return baseList;

        var ids = baseList.Select(b => b.CoordinacionId).ToList();

        var cursos = await _db.CoordinacionesCursos.AsNoTracking()
            .Where(x => ids.Contains(x.CoordinacionId))
            .GroupBy(x => x.CoordinacionId)
            .Select(g => new { CoordinacionId = g.Key, Cursos = g.Select(x => x.CursoId).ToList() })
            .ToListAsync(ct);

        var map = cursos.ToDictionary(x => x.CoordinacionId, x => x.Cursos);
        foreach (var item in baseList)
            if (map.TryGetValue(item.CoordinacionId, out var list))
                item.CursoIds = list;

        return baseList;
    }
}
