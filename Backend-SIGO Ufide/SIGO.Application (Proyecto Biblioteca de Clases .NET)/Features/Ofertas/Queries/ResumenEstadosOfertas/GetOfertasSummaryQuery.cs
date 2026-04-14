using MediatR;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;

namespace SIGO.Application.Features.Ofertas.Queries.ResumenEstadosOfertas
{
    public sealed record GetOfertasSummaryQuery(OfertaCategory Category) : IRequest<OfertasSummaryDto>;

}
