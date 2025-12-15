namespace SIGO.Application.Features.Notificaciones.DTOs;

public class NotificacionDto
{
    public int NotificacionId { get; set; }
    public int PersonaId { get; set; }
    public int OfertaId { get; set; }
    public int SolicitudOfertaId { get; set; }
    public bool Leido { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaEvento { get; set; }
}
