namespace SIGO.Application.Features.Permanencia4.Dtos
{
    public sealed class Permanencia4MetaDto
    {
        public int TotalRegistros { get; set; }
    }

    public sealed class Permanencia4RowDto
    {
        public string NombreCompleto { get; set; } = "";
        public string PeriodoIngreso { get; set; } = "";
        public int AniosPermanencia { get; set; }
    }
}
