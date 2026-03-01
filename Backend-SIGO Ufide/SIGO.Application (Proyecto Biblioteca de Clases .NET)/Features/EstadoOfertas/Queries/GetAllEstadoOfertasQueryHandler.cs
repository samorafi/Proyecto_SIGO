using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.EstadoOfertas.Dto;

namespace SIGO.Application.Features.EstadoOfertas.Queries.GetAll;

public sealed class GetAllEstadoOfertasQueryHandler
    : IRequestHandler<GetAllEstadoOfertasQuery, IReadOnlyList<EstadoOfertaResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetAllEstadoOfertasQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<EstadoOfertaResponseDto>> Handle(GetAllEstadoOfertasQuery request, CancellationToken ct)
    {
        return await _db.EstadoOfertas
            .AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => new EstadoOfertaResponseDto
            {
                EstadoOfertaId = x.EstadoOfertaId,
                Nombre = x.Nombre
            })
            .ToListAsync(ct);
    }
}
