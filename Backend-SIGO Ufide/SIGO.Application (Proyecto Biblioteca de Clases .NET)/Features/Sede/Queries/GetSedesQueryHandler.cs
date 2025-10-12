using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Sedes.Dto;

namespace SIGO.Application.Features.Sedes.Queries;

public sealed class GetSedesQueryHandler
    : IRequestHandler<GetSedesQuery, List<SedeResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetSedesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<SedeResponseDto>> Handle(GetSedesQuery request, CancellationToken ct)
        => await _db.Sedes.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => new SedeResponseDto { SedeId = x.SedeId, Nombre = x.Nombre })
            .ToListAsync(ct);
}
