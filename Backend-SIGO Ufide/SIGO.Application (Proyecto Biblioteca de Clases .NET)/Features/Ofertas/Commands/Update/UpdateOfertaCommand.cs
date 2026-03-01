using MediatR;
using SIGO.Application.Features.Ofertas.Commands.Update;

public record UpdateOfertaCommand(int OfertaId, UpdateOfertaRequest Data) : IRequest<Unit>;
