using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Queries.ObtenerOfertasReportes;

public record GetAllOfertasReporteQuery : IRequest<IReadOnlyList<OfertaResponseDto>>;