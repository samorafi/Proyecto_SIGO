using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Periodos.Dto;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Periodos.Queries;

public sealed class GetPeriodoByIdQueryHandler : IRequestHandler<GetPeriodoByIdQuery, PeriodoDto?>
{
    private readonly IApplicationDbContext _db;
    public GetPeriodoByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PeriodoDto?> Handle(GetPeriodoByIdQuery request, CancellationToken ct)
        => await _db.Periodos.AsNoTracking()
            .Where(x => x.PeriodoId == request.Id)
            .Select(x => new PeriodoDto
            {
                PeriodoId = x.PeriodoId,
                Anio = x.Anio,
                Numero = x.Numero,
                Estado = x.Estado,
                Tipo = x.Tipo == PeriodoTipo.Cuatrimestre ? "C"
                          : x.Tipo == PeriodoTipo.Trimestre ? "T"
                          : "P",
                Etiqueta = x.Etiqueta
            })
            .FirstOrDefaultAsync(ct);
}
