using MediatR;

namespace SIGO.Application.Features.Notificaciones.Queries.CountNoLeidas;

public record GetNotificacionesNoLeidasCountQuery(int? PersonaId) : IRequest<int>;
