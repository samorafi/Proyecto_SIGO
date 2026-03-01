namespace SIGO.Application.Features.Horarios.Dto;

public class HorarioResponseDto
{
    public int HorarioId { get; set; }
    public string Dia { get; set; } = null!;
    public string Rango { get; set; } = null!;
}
