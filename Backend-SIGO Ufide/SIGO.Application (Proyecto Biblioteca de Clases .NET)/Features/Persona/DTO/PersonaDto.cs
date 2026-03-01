public class PersonaDto
{
    public int PersonaId { get; set; }
    public string Nombre { get; set; } = null!;
    public string? PrimerApellido { get; set; }
    public string? SegundoApellido { get; set; }

    public string Cedula { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string Telefono { get; set; } = null!;
    public string? Comentarios { get; set; }

    public int? PeriodoIngresoId { get; set; }
    public string? PeriodoIngresoEtiqueta { get; set; }

    public string? Genero { get; set; }
    public string? Provincia { get; set; }
    public string? Canton { get; set; }
    public string? Categoria { get; set; }
    public string? Atestado { get; set; }
    public string? Estado { get; set; }
    public string? TipoContrato { get; set; }
    public string? RolDocente { get; set; }

    public int EstadoPersonaId { get; set; }
    public int? MotivoDesvinculacionId { get; set; }
    public int? PeriodoDesvinculacionId { get; set; }
    public bool EnLinea { get; set; }
    public string? Sede { get; set; }

    public static PersonaDto FromEntity(SIGO.Domain.Entities.Persona p) => new()
    {
        PersonaId = p.Id,
        Nombre = p.Nombre,
        PrimerApellido = p.PrimerApellido,
        SegundoApellido = p.SegundoApellido,
        Cedula = p.Cedula,
        Correo = p.Correo,
        Telefono = p.Telefono,
        Comentarios = p.Comentarios,

        PeriodoIngresoId = p.PeriodoIngresoId,
        PeriodoIngresoEtiqueta = p.PeriodoIngreso?.Etiqueta,

        Genero = p.Genero?.Nombre,
        Provincia = p.Provincia?.Nombre,
        Canton = p.Canton?.Nombre,

        Categoria = p.CategoriaDocente?.Nombre,

        Atestado = p.Atestado?.Nombre,
        Estado = p.EstadoPersona?.Nombre,
        TipoContrato = p.TipoContrato?.Nombre,
        RolDocente = p.RolDocente?.Nombre,

        EstadoPersonaId = p.EstadoPersonaId ?? 0,
        MotivoDesvinculacionId = p.MotivoDesvinculacionId,
        PeriodoDesvinculacionId = p.PeriodoDesvinculacionId,
        EnLinea = p.EnLinea,
        Sede = p.Sede?.Nombre
    };
}
