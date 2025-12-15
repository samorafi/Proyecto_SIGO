using MediatR;

namespace SIGO.Application.Features.Notificaciones.Commands.MarcarLeida;

public record MarcarNotificacionLeidaCommand(int NotificacionId) : IRequest<bool>;
