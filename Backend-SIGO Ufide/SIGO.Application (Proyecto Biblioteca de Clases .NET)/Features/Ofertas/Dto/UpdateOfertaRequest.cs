namespace SIGO.Application.Features.Ofertas.Commands.Update;

public class UpdateOfertaRequest_v2
{
    public int HorarioId { get; set; }
    public int? AccionId { get; set; }
    public int? CoordinadorId { get; set; }
    public string? Comentarios { get; set; }
    public int? Cupo { get; set; }
    public int Grupo { get; set; }
    public int? Matriculados { get; set; }

}
