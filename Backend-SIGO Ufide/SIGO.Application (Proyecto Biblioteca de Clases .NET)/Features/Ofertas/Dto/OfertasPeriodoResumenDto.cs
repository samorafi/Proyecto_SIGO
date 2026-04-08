namespace SIGO.Application.Features.Ofertas.Dto;

public sealed class OfertasPeriodoResumenDto
{
    public int PeriodoId { get; set; }
    public string Periodo { get; set; } = string.Empty;
    public int TotalOfertas { get; set; }
}