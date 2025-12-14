namespace SIGO.Application.Features.Ofertas.Dto;

public class OfertaResponseDto
{
    public int OfertaId { get; set; }
    public string? Curso { get; set; }
    public string? Sede { get; set; }
    public string? Modalidad { get; set; }
    public int HorarioId { get; set; }
    public string? Periodo { get; set; }
    public string? Accion { get; set; }
    public int? CoordinadorId { get; set; }
    public string? Comentarios { get; set; }
    public string? Estado { get; set; }
    public int Grupo { get; set; }
    public int? Cupo { get; set; }
    public int? Matriculados { get; set; }
    public Boolean? Archivados { get; set; }
    public int? PersonaId { get; set; }

    public static OfertaResponseDto FromEntity(SIGO.Domain.Entities.Oferta o) => new()
    {
        OfertaId = o.OfertaId,
        Curso = o.Curso?.Codigo,
        Sede = o.Sede?.Nombre,
        Modalidad = o.Modalidad?.Nombre,
        HorarioId = o.HorarioId,
        Periodo = o.Periodo?.Etiqueta,
        Accion = o.Accion?.Nombre,
        CoordinadorId = o.CoordinadorId,
        Comentarios = o.Comentarios,
        Estado = o.EstadoOferta?.Nombre,
        Grupo = o.Grupo,
        Cupo = o.Cupo,
        Matriculados = o.Matriculados,
        Archivados = o.Archivados,
        PersonaId = o.PersonaId

    };
}
