namespace SIGO.Application.Features.Personas.Dto;

public class CoordinadorResponseDto
{
    public int Id { get; set; }       
    public string Nombre { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string PrimerApellido { get; set; } = null!;
    public string SegundoApellido { get; set; } = null!;
}
