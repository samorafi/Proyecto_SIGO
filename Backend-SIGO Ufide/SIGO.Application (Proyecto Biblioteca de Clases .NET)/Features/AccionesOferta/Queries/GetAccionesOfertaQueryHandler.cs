using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.AccionesOferta.Dto;

namespace SIGO.Application.Features.AccionesOferta.Queries;

public sealed class GetAccionesOfertaQueryHandler
    : IRequestHandler<GetAccionesOfertaQuery, List<AccionOfertaResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetAccionesOfertaQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<AccionOfertaResponseDto>> Handle(GetAccionesOfertaQuery request, CancellationToken ct)
        => await _db.AccionesOferta.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => new AccionOfertaResponseDto { AccionId = x.AccionId, Nombre = x.Nombre })
            .ToListAsync(ct);
}
