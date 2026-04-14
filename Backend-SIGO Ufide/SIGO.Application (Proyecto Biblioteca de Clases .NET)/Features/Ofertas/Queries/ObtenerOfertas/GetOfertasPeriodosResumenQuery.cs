using MediatR;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;

namespace SIGO.Application.Features.Ofertas.Queries.ObtenerOfertas;

public sealed record GetOfertasPeriodosResumenQuery(OfertaCategory Category)
    : IRequest<IReadOnlyList<OfertasPeriodoResumenDto>>;