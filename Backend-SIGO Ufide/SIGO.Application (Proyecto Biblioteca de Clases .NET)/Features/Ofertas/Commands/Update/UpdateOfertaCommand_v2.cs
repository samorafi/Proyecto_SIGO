using MediatR;
using SIGO.Application.Features.Ofertas.Commands.Update;

public record UpdateOfertaCommand_v2(int OfertaId, UpdateOfertaRequest_v2 Data) : IRequest<Unit>;
