using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Cursos.Dto;

namespace SIGO.Application.Features.Cursos.Queries;

public sealed class GetCursoByIdQueryHandler
    : IRequestHandler<GetCursoByIdQuery, CursoResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetCursoByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<CursoResponseDto?> Handle(GetCursoByIdQuery request, CancellationToken ct)
    {
        var c = await _db.Cursos
            .AsNoTracking()
            .Where(x => x.CursoId == request.Id)
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
            .FirstOrDefaultAsync(ct);

        return c; // null si no existe
    }
}
