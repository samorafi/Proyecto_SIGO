using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Periodos.Dto;

namespace SIGO.Application.Features.Periodos.Queries;

public sealed class GetPeriodoByIdQueryHandler : IRequestHandler<GetPeriodoByIdQuery, PeriodoResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetPeriodoByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PeriodoResponseDto?> Handle(GetPeriodoByIdQuery request, CancellationToken ct)
        => await _db.Periodos.AsNoTracking()
            .Where(x => x.PeriodoId == request.Id)
            .Select(x => new PeriodoResponseDto { PeriodoId = x.PeriodoId, Anio = x.Anio, Numero = x.Numero, Estado = x.Estado })
            .FirstOrDefaultAsync(ct);
}
