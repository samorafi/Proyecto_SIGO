namespace SIGO.Domain.Entities;

public enum PeriodoTipo
{
    Cuatrimestre = 1,   // C
    Trimestre = 2,      // T
    Mensual = 3         // P
}

public class Periodo
{
    public int PeriodoId { get; set; }    
    public int Anio { get; set; }          
    public int Numero { get; set; }        
    public bool Estado { get; set; }        
    public PeriodoTipo Tipo { get; set; }  
    public string Etiqueta { get; private set; } = null!;

    public string EtiquetaRuntime =>
        Tipo switch
        {
            PeriodoTipo.Cuatrimestre => $"{Numero}C, {Anio}",
            PeriodoTipo.Trimestre => $"{Numero}T, {Anio}",
            PeriodoTipo.Mensual => $"{Numero}P, {Anio}",
            _ => $"{Numero}, {Anio}"
        };

}
