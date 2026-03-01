using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    public class RolPermiso
    {
        public int RolId { get; set; }
        public int PermisoId { get; set; }

        public Rol Rol { get; set; }
        public Permiso Permiso { get; set; }
    }
}
