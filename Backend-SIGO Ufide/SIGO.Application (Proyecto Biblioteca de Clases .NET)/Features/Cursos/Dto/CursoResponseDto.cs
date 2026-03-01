namespace SIGO.Application.Features.Cursos.Dto;

public class CursoResponseDto
{
    public int CursoId { get; set; }
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public int? CarreraId { get; set; }
    public int? GradoId { get; set; }
    public bool EsNetcad { get; set; }
    public bool Estado { get; set; }
}
