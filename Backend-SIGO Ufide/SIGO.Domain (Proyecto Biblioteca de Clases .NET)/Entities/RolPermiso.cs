using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    [Table("rol_permiso", Schema = "public")]
    public class RolPermiso
    {
        [Key, Column("rol_id", Order = 0)]
        public int RolId { get; set; }

        [Key, Column("permiso_id", Order = 1)]
        public int PermisoId { get; set; }

        [ForeignKey("RolId")]
        public Rol Rol { get; set; }

        [ForeignKey("PermisoId")]
        public Permiso Permiso { get; set; }
    }
}
