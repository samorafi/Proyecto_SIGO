// namespace SIGO.Domain.Entities;
using SIGO.Domain.Entities;

public class Oferta
{
    public int OfertaId { get; set; }
    public int CursoId { get; set; }
    public int SedeId { get; set; }
    public int ModalidadId { get; set; }
    public int HorarioId { get; set; }
    public int PeriodoId { get; set; }

    public int? AccionId { get; set; } 
    public int? CoordinadorId { get; set; }  
    public string? Comentarios { get; set; }

    public AccionOferta? Accion { get; set; }
    public Persona? Coordinador { get; set; }
    public Curso? Curso { get; set; }
    public Sede? Sede { get; set; }
    public Modalidad? Modalidad { get; set; }
    public Horario? Horario { get; set; }
    public Periodo? Periodo { get; set; }
}
