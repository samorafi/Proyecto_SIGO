namespace SIGO.Application.Features.Permisos.Dto
{
    public class PermisoDto
    {
        public int PermisoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Clave { get; set; } = string.Empty;
        public string Ruta { get; set; } = string.Empty;
    }
}
