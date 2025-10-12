namespace SIGO.Application.Features.Periodos.Dto;

public class CreatePeriodoRequest
{
    public int Anio { get; set; }
    public int Numero { get; set; }
    public bool Estado { get; set; } = true;
}
