namespace SIGO.Application.Features.Periodos.Dto;

public class UpdatePeriodoRequest
{
    public int Anio { get; set; }
    public int Numero { get; set; }
    public bool Estado { get; set; } = true;
}