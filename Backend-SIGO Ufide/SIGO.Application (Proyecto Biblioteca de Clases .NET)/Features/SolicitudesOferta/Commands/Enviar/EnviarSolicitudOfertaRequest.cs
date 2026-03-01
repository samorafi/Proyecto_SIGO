namespace SIGO.Application.Features.SolicitudesOferta.Commands.Enviar;

public class EnviarSolicitudOfertaRequest
{
    public int OfertaId { get; set; }
    public int PersonaId { get; set; }
    public int? EvaluacionPeriodoId { get; set; }

}
