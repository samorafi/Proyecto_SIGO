using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Periodos.Dto;

namespace SIGO.Application.Features.Periodos.Queries;

public sealed class GetPeriodosQueryHandler : IRequestHandler<GetPeriodosQuery, List<PeriodoResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetPeriodosQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<PeriodoResponseDto>> Handle(GetPeriodosQuery request, CancellationToken ct)
    {
        var q = _db.Periodos.AsNoTracking().AsQueryable();
        if (request.Estado.HasValue) q = q.Where(x => x.Estado == request.Estado.Value);

        return await q.OrderByDescending(x => x.Anio).ThenBy(x => x.Numero)
            .Select(x => new PeriodoResponseDto { PeriodoId = x.PeriodoId, Anio = x.Anio, Numero = x.Numero, Estado = x.Estado })
            .ToListAsync(ct);
    }
}
