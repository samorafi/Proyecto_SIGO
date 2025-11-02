namespace SIGO.Application.Features.Periodos.Dto;

public class CreatePeriodoRequest
{
    public int Anio { get; set; }
    public int Numero { get; set; }      
    public string Tipo { get; set; } = "C";  
    public bool Estado { get; set; } = true;   
}
