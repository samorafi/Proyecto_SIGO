using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Commands.Create;

public sealed record CreateOfertaCommand(CreateOfertaRequest Data) : IRequest<OfertaResponseDto>;
