namespace SIGO.Domain.Entities;

public class Oferta
{
    public int OfertaId { get; set; }
    public int? CursoId { get; set; }
    public int? SedeId { get; set; }
    public int? ModalidadId { get; set; }
    public int HorarioId { get; set; }
    public int? PeriodoId { get; set; }

    public int? AccionId { get; set; }
    public int? CoordinadorId { get; set; }
    public string? Comentarios { get; set; }
    public int? EstadoOfertaId { get; set; }
    public int Grupo { get; set; }      
    public int? Cupo { get; set; }        
    public int? Matriculados { get; set; }  
    public Boolean Archivados { get; set; }

    public virtual AccionOferta? Accion { get; set; }
    public virtual Persona? Coordinador { get; set; }
    public virtual Curso? Curso { get; set; }
    public virtual Sede? Sede { get; set; }
    public virtual Modalidad? Modalidad { get; set; }
    public virtual Horario? Horario { get; set; }
    public virtual Periodo? Periodo { get; set; }
    public virtual EstadoOferta EstadoOferta { get; set; }
}
