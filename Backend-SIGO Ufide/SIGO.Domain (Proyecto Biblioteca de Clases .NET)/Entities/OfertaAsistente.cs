namespace SIGO.Domain.Entities;

public class OfertaAsistente
{
    public int OfertaAsistenteId { get; set; }
    public int OfertaId { get; set; }
    public int PersonaId { get; set; }

    public Oferta Oferta { get; set; } = null!;
    public Persona Persona { get; set; } = null!;
}