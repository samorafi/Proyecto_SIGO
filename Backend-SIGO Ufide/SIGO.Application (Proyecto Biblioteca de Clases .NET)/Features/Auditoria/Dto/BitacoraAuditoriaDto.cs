using System.Text.Json;

namespace SIGO.Application.Features.Auditoria.Dto
{
    public class BitacoraAuditoriaDto
    {
        public int Id { get; set; }
        public string? Usuario { get; set; }
        public string? TablaAfectada { get; set; }
        public string? Accion { get; set; }
        public int? RegistroId { get; set; }
        public JsonElement? ValoresAnteriores { get; set; }
        public JsonElement? ValoresNuevos { get; set; }
        public string? IpOrigen { get; set; }
        public string? Descripcion { get; set; }
        public DateTime Fecha { get; set; }
    }
}
