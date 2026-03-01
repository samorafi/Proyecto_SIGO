namespace SIGO.Application.Features.Auditoria.Dto
{
    public class AuditQueryParams
    {
        public string? Tabla { get; set; }
        public int? RegistroId { get; set; }
        public string? Usuario { get; set; }
        public string? Accion { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }

        // Paginación y orden
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SortBy { get; set; } = "fecha";
        public string? SortDir { get; set; } = "desc";
    }
}
