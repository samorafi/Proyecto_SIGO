using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Periodos.Dto;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Periodos.Queries;

public sealed class GetPeriodosQueryHandler : IRequestHandler<GetPeriodosQuery, List<PeriodoDto>>
{
    private readonly IApplicationDbContext _db;
    public GetPeriodosQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<PeriodoDto>> Handle(GetPeriodosQuery request, CancellationToken ct)
    {
        var q = _db.Periodos.AsNoTracking().AsQueryable();

        if (request.Estado.HasValue)
            q = q.Where(x => x.Estado == request.Estado.Value);

        return await q.Select(x => new PeriodoDto
        {
            PeriodoId = x.PeriodoId,
            Anio = x.Anio,
            Numero = x.Numero,
            Estado = x.Estado,                      
            Tipo = x.Tipo == PeriodoTipo.Cuatrimestre ? "C"
                 : x.Tipo == PeriodoTipo.Trimestre ? "T" : "P",
            Etiqueta = x.Etiqueta
        }).ToListAsync(ct);
    }
}
