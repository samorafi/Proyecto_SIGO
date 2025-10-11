using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Commands.Update;

public sealed record UpdateOfertaCommand(int Id, UpdateOfertaRequest Data): IRequest<OfertaResponseDto?>; 
