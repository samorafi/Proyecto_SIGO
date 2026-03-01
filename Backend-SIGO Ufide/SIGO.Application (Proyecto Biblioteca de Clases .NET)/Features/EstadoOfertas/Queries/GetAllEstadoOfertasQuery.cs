using MediatR;
using SIGO.Application.Features.EstadoOfertas.Dto;

namespace SIGO.Application.Features.EstadoOfertas.Queries.GetAll;

public sealed record GetAllEstadoOfertasQuery : IRequest<IReadOnlyList<EstadoOfertaResponseDto>>;
