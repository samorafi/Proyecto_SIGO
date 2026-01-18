namespace SIGO.Application.Features.Nomina.Dto
{
    public class NominaDocenteRowDto
    {
        public string NombreCompleto { get; set; } = "";
        public string? PeriodoIngreso { get; set; }
        public string? PeriodoDesvinculacion { get; set; }
        public string? Estado { get; set; }
        public string? MotivoDesvinculacion { get; set; }
    }
}
