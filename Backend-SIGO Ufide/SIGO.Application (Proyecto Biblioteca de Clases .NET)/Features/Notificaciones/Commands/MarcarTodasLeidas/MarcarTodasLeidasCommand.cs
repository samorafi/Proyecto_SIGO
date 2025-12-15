using MediatR;

namespace SIGO.Application.Features.Notificaciones.Commands.MarcarTodasLeidas;

public record MarcarTodasLeidasCommand() : IRequest<int>;
