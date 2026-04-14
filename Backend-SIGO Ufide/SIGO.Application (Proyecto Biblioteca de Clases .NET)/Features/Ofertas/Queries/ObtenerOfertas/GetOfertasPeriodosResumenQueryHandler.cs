using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;

namespace SIGO.Application.Features.Ofertas.Queries.ObtenerOfertas;

public sealed class GetOfertasPeriodosResumenQueryHandler
    : IRequestHandler<GetOfertasPeriodosResumenQuery, IReadOnlyList<OfertasPeriodoResumenDto>>
{
    private readonly IApplicationDbContext _db;

    public GetOfertasPeriodosResumenQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<OfertasPeriodoResumenDto>> Handle(
        GetOfertasPeriodosResumenQuery request,
        CancellationToken ct)
    {
        var query = _db.Ofertas
            .AsNoTracking()
            .Where(o => o.Archivados == false);

        query = request.Category switch
        {
            OfertaCategory.PresencialVirtual => query.Where(o =>
                o.ModalidadId == 1 || o.ModalidadId == 2),

            OfertaCategory.EnLinea => query.Where(o =>
                o.ModalidadId == 3),

            OfertaCategory.Historico => _db.Ofertas
                .AsNoTracking()
                .Where(o => o.Archivados == true),

            _ => query
        };

        var items = await query
            .Where(o => o.PeriodoId != null && o.Periodo != null)
            .GroupBy(o => new
            {
                o.PeriodoId,
                Etiqueta = o.Periodo!.Etiqueta
            })
            .Select(g => new OfertasPeriodoResumenDto
            {
                PeriodoId = g.Key.PeriodoId!.Value,
                Periodo = g.Key.Etiqueta ?? string.Empty,
                TotalOfertas = g.Count()
            })
            .OrderByDescending(x => x.PeriodoId)
            .ToListAsync(ct);

        return items;
    }
}