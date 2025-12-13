namespace SIGO.Application.Features.Ofertas.Dto
{
    public class ArchivarOfertasResponseDto
    {
        public int TotalAfectadas { get; set; }
        public bool YaArchivadas { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
