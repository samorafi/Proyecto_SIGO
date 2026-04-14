namespace SIGO.Application.Features.OfertaAsistenteSolicitudes.Commands.Enviar;

public class EnviarOfertaAsistenteSolicitudRequest
{
    public int OfertaId { get; set; }
    public int PersonaId { get; set; }
    public int? EvaluacionPeriodoId { get; set; }
}