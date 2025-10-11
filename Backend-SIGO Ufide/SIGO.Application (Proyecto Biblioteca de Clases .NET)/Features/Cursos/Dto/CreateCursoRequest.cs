namespace SIGO.Application.Features.Cursos.Dto;

public class CreateCursoRequest
{
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public int? CarreraId { get; set; }
    public int? GradoId { get; set; }
    public bool EsNetcad { get; set; } = false;
    public bool Estado { get; set; } = true;
}
