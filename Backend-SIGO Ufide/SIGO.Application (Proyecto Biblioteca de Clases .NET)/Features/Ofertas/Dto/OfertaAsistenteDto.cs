namespace SIGO.Application.Features.Ofertas.Dto;

public class OfertaAsistenteDto
{
    public int PersonaId { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Correo { get; set; }

    // Solicitud de correo al asistente
    public int? EstadoSolicitud { get; set; }          // null = no enviada, 0 = pendiente, 1 = aceptada, 2 = rechazada
    public string EstadoSolicitudTexto { get; set; } = "No enviada";

    public int? EstadoEnvio { get; set; }              // null = no enviada, 0 = pendiente, 1 = enviado ok, 2 = error
    public string EstadoEnvioTexto { get; set; } = "No enviada";

    public DateTime? FechaEnvio { get; set; }
    public DateTime? FechaRespuesta { get; set; }
}