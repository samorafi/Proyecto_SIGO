namespace SIGO.Application.Features.Notificaciones.Commands.Crear;

public class CrearNotificacionRequest
{
    public int PersonaId { get; set; }
    public int OfertaId { get; set; }
    public int SolicitudOfertaId { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public DateTime? FechaEvento { get; set; }
}
