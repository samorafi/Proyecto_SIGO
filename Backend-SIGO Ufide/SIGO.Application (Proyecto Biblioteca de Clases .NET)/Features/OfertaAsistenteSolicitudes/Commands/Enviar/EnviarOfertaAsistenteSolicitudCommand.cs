using MediatR;

namespace SIGO.Application.Features.OfertaAsistenteSolicitudes.Commands.Enviar;

public record EnviarOfertaAsistenteSolicitudCommand(
    EnviarOfertaAsistenteSolicitudRequest Data
) : IRequest<int>;