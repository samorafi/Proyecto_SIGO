namespace SIGO.Application.Features.Personas.Dto;

public class CreatePersonaRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string PrimerApellido { get; set; }
    public string SegundoApellido { get; set; }
    public string Cedula { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;

    public string? Telefono { get; set; }
    public int? PeriodoIngresoId { get; set; }
    public string? Comentarios { get; set; }

    public int? GeneroId { get; set; }
    public int? ProvinciaId { get; set; }
    public int? CantonId { get; set; }
    public int? CategoriaId { get; set; }
    public int? AtestadoId { get; set; }
    public int? TipoContratoId { get; set; }
    public int? RolDocenteId { get; set; }
    public bool EnLinea { get; set; }
    public int? SedeId { get; set; }
}
