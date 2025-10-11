using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Cursos.Dto;

namespace SIGO.Application.Features.Cursos.Queries;

public sealed class GetCursosQueryHandler
    : IRequestHandler<GetCursosQuery, List<CursoResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetCursosQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<CursoResponseDto>> Handle(GetCursosQuery request, CancellationToken ct)
    {
        var q = _db.Cursos.AsNoTracking().AsQueryable();

        if (request.Estado.HasValue)
            q = q.Where(x => x.Estado == request.Estado.Value);

        return await q
            .OrderBy(x => x.Nombre)
            .Select(x => new CursoResponseDto
            {
                CursoId = x.CursoId,
                Codigo = x.Codigo,
                Nombre = x.Nombre,
                CarreraId = x.CarreraId,
                GradoId = x.GradoId,
                EsNetcad = x.EsNetcad,
                Estado = x.Estado
            })
            .ToListAsync(ct);
    }
}
