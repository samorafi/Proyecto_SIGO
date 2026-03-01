namespace SIGO.Application.Features.Ofertas.Dto;

public sealed class OfertasSummaryDto
{
    public int Total { get; set; }
    public List<EstadoCountDto> PorEstado { get; set; } = new();
}