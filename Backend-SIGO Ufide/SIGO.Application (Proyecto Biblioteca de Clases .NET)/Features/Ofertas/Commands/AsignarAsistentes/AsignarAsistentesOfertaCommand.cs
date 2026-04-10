using MediatR;

namespace SIGO.Application.Features.Ofertas.Commands.AsignarAsistentes;

public sealed record AsignarAsistentesOfertaCommand(
    int OfertaId,
    List<int> PersonaIds
) : IRequest<Unit>;