namespace SIGO.Domain.Entities;

public class OfertaAsistenteSolicitud
{
    public int OfertaAsistenteSolicitudId { get; set; }

    public int OfertaId { get; set; }
    public int PersonaId { get; set; }

    public string DestinatarioEmail { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string Cuerpo { get; set; } = string.Empty;

    public short EstadoSolicitud { get; set; } = 0;

    public DateTime FechaEnvio { get; set; }
    public DateTime? FechaRespuesta { get; set; }

    public string Token { get; set; } = string.Empty;

    public short EstadoEnvio { get; set; } = 0;

    public string? ErrorEnvio { get; set; }

    public virtual Oferta Oferta { get; set; } = null!;
    public virtual Persona Persona { get; set; } = null!;
}