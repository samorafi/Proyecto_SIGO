using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;

namespace SIGO.Application.Features.Ofertas.Queries.ResumenEstadosOfertas
{
    public sealed class GetOfertasSummaryQueryHandler
        : IRequestHandler<GetOfertasSummaryQuery, OfertasSummaryDto>
    {
        private readonly IApplicationDbContext _db;
        public GetOfertasSummaryQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<OfertasSummaryDto> Handle(GetOfertasSummaryQuery request, CancellationToken ct)
        {
            var query = _db.Ofertas.AsNoTracking().AsQueryable();

            query = request.Category switch
            {
                OfertaCategory.PresencialVirtual => query.Where(o => !o.Archivados && (o.ModalidadId == 1 || o.ModalidadId == 2)),
                OfertaCategory.EnLinea => query.Where(o => !o.Archivados && o.ModalidadId == 3),
                OfertaCategory.Historico => query.Where(o => o.Archivados),
                _ => query
            };

            var total = await query.CountAsync(ct);

            var porEstado = await query
                .GroupBy(o => o.EstadoOferta.Nombre)
                .Select(g => new EstadoCountDto
                {
                    Estado = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync(ct);

            return new OfertasSummaryDto { Total = total, PorEstado = porEstado };
        }
    }

}