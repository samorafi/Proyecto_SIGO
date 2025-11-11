namespace SIGO.Domain.Entities
{
    public class BitacoraAuditoria
    {
        public int Id { get; set; }
        public string? Usuario { get; set; }
        public string? TablaAfectada { get; set; }
        public string? Accion { get; set; }
        public int? RegistroId { get; set; }
        public string? ValoresAnteriores { get; set; }
        public string? ValoresNuevos { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public string? IpOrigen { get; set; }
        public string? Descripcion { get; set; }
    }

}
