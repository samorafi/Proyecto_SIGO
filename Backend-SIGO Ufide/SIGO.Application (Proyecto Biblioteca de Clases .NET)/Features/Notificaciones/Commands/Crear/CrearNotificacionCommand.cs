using MediatR;

namespace SIGO.Application.Features.Notificaciones.Commands.Crear;

public record CrearNotificacionCommand(CrearNotificacionRequest Data) : IRequest<int>;
