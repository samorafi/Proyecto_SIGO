namespace SIGO.Domain.Entities;

public class SolicitudOferta
{
    public int SolicitudOfertaId { get; set; }

    public int OfertaId { get; set; }

    // FK hacia Persona (docente)
    public int PersonaId { get; set; }

    public string DestinatarioEmail { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string Cuerpo { get; set; } = string.Empty;

    /// <summary>
    /// 0 = Pendiente, 1 = Aceptada, 2 = Rechazada
    /// </summary>
    public short EstadoSolicitud { get; set; } = 0;

    public DateTime FechaEnvio { get; set; }
    public DateTime? FechaRespuesta { get; set; }

    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// 0 = Pendiente, 1 = Enviado OK, 2 = Error
    /// </summary>
    public short EstadoEnvio { get; set; } = 0;

    public string? ErrorEnvio { get; set; }

    // Navegaciones
    public virtual Oferta Oferta { get; set; } = null!;
    public virtual Persona Persona { get; set; } = null!;
}
