namespace SIGO.Application.Features.Periodos.Dto;

public class PeriodoDto
{
    public int PeriodoId { get; set; }
    public int Anio { get; set; }
    public int Numero { get; set; }
    public string Tipo { get; set; } = null!;
    public bool Estado { get; set; }
    public string Etiqueta { get; set; } = null!;

    public static PeriodoDto FromEntity(SIGO.Domain.Entities.Periodo p)
    {
        var tipo = p.Tipo switch
        {
            SIGO.Domain.Entities.PeriodoTipo.Cuatrimestre => "C",
            SIGO.Domain.Entities.PeriodoTipo.Trimestre => "T",
            SIGO.Domain.Entities.PeriodoTipo.Mensual => "P",
            _ => "C"
        };

        return new PeriodoDto
        {
            PeriodoId = p.PeriodoId,
            Anio = p.Anio,
            Numero = p.Numero,
            Tipo = tipo,
            Estado = p.Estado,
            Etiqueta = string.IsNullOrWhiteSpace(p.Etiqueta) ? p.EtiquetaRuntime : p.Etiqueta
        };
    }
}
