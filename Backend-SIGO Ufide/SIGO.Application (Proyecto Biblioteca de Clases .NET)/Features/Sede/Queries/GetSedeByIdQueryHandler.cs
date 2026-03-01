using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Sedes.Dto;

namespace SIGO.Application.Features.Sedes.Queries;

public sealed class GetSedeByIdQueryHandler
    : IRequestHandler<GetSedeByIdQuery, SedeResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetSedeByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<SedeResponseDto?> Handle(GetSedeByIdQuery request, CancellationToken ct)
        => await _db.Sedes.AsNoTracking()
            .Where(x => x.SedeId == request.Id)
            .Select(x => new SedeResponseDto { SedeId = x.SedeId, Nombre = x.Nombre })
            .FirstOrDefaultAsync(ct);
}
