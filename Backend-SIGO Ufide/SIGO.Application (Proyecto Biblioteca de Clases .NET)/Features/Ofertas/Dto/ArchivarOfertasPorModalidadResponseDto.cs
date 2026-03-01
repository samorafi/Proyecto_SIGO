namespace SIGO.Application.Features.Ofertas.Dto;

public class ArchivarOfertasPorModalidadResponseDto
{
    public string Mensaje { get; set; } = string.Empty;
    public bool YaArchivadas { get; set; }
    public int TotalAfectadas { get; set; }
}
