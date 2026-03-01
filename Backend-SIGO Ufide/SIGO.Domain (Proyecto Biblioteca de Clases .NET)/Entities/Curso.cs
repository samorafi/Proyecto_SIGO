// SIGO.Domain.Entities
using SIGO.Domain.Entities;

public class Curso
{
    public int CursoId { get; set; }
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;

    public int? CarreraId { get; set; }
    public int? GradoId { get; set; }
    public bool EsNetcad { get; set; }
    public bool Estado { get; set; } = true;


    public Carrera? Carrera { get; set; }
    public Grado? Grado { get; set; }
}
