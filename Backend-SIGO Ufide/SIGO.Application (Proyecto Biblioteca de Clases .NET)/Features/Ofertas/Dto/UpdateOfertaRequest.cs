namespace SIGO.Application.Features.Ofertas.Commands.Update;

public class UpdateOfertaRequest
{
    public int? CursoId { get; set; }
    public int? SedeId { get; set; }
    public int? ModalidadId { get; set; }
    public int HorarioId { get; set; }
    public int? PeriodoId { get; set; }
    public int? AccionId { get; set; }
    public int? CoordinadorId { get; set; }
    public string? Comentarios { get; set; }
    public int? EstadoOfertaId { get; set; }
    public int? Cupo { get; set; }
    public int? Matriculados { get; set; }
    public Boolean Archivados { get; set; }
}
