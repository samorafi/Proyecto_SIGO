namespace SIGO.Application.Features.Carreras.Dto;
public class CreateCarreraRequest
{
    public string Nombre { get; set; } = null!;
    public bool Estado { get; set; } = true;
}