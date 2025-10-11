using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Queries;

public record GetOfertaByIdQuery(int OfertaId) : IRequest<OfertaResponseDto?>;
