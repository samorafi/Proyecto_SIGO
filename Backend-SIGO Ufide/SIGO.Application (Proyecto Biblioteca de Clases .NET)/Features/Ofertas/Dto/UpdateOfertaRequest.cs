namespace SIGO.Application.Features.Ofertas.Dto;

public class UpdateOfertaRequest
{
    public int CursoId { get; set; }
    public int SedeId { get; set; }
    public int ModalidadId { get; set; }
    public int HorarioId { get; set; }
    public int PeriodoId { get; set; }
    public int? AccionId { get; set; }
    public int? CoordinadorId { get; set; }
    public string? Comentarios { get; set; }
}

