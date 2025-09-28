using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    public class Permiso
    {
        public int PermisoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Clave { get; set; } = string.Empty;
        public string Ruta { get; set; } = string.Empty;

        // Relaciones
        public ICollection<RolPermiso> RolPermisos { get; set; } = new List<RolPermiso>();
    }
}
