namespace SIGO.Domain.Entities;

public class CoordinacionCurso
{
    public int CoordinacionCursoId { get; set; }
    public int CoordinacionId { get; set; }
    public int CursoId { get; set; }
    public bool Estado { get; set; } = true;
    public string? Comentarios { get; set; }

    public Coordinacion? Coordinacion { get; set; }
    public Curso? Curso { get; set; }
}
