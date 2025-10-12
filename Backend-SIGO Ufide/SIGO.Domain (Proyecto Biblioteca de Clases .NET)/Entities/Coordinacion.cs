namespace SIGO.Domain.Entities;

public class Coordinacion
{
    public int CoordinacionId { get; set; }
    public int PersonaId { get; set; }
    public int? CarreraId { get; set; }
    public int PeriodoId { get; set; }
    public bool Estado { get; set; } = true;
    public string? Comentarios { get; set; }

    public Persona? Persona { get; set; }
    public Carrera? Carrera { get; set; }
    public Periodo? Periodo { get; set; }

    public ICollection<CoordinacionCurso> Cursos { get; set; } = new List<CoordinacionCurso>();
}
