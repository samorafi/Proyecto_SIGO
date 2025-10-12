namespace SIGO.Application.Features.Coordinaciones.Dto;

public class CreateCoordinacionRequest
{
    public int PersonaId { get; set; }
    public int? CarreraId { get; set; }
    public int PeriodoId { get; set; }
    public bool Estado { get; set; } = true;
    public string? Comentarios { get; set; }
    public List<int>? CursoIds { get; set; }
}

public class UpdateCoordinacionRequest
{
    public int PersonaId { get; set; }
    public int? CarreraId { get; set; }
    public int PeriodoId { get; set; }
    public bool Estado { get; set; } = true;
    public string? Comentarios { get; set; }
    public List<int>? CursoIds { get; set; }
}

public class CoordinacionResponseDto
{
    public int CoordinacionId { get; set; }
    public int PersonaId { get; set; }
    public int? CarreraId { get; set; }
    public int PeriodoId { get; set; }
    public bool Estado { get; set; }
    public string? Comentarios { get; set; }
    public List<int> CursoIds { get; set; } = new();
}
