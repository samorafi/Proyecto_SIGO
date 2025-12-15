using MediatR;
using SIGO.Application.Features.Notificaciones.DTOs;

namespace SIGO.Application.Features.Notificaciones.Queries.Listar;

public class GetNotificacionesQuery : IRequest<GetNotificacionesResponse>
{
    public int? PersonaId { get; set; }
    public bool? SoloNoLeidas { get; set; }
    public string? Search { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class GetNotificacionesResponse
{
    public int Total { get; set; }
    public List<NotificacionDto> Items { get; set; } = new();
}
