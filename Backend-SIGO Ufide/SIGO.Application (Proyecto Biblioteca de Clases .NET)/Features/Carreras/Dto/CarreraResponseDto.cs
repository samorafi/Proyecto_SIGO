namespace SIGO.Application.Features.Carreras.Dto;
public class CarreraResponseDto
{
    public int CarreraId { get; set; }
    public string Nombre { get; set; } = null!;
    public bool Estado { get; set; }
}