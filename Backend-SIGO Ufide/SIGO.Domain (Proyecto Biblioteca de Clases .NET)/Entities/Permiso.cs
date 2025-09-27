using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    [Table("permiso", Schema = "public")]
    public class Permiso
    {
        [Key]
        [Column("permiso_id")]
        public int PermisoId { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("clave")]
        public string Clave { get; set; }

        [Column("ruta")]
        public string Ruta { get; set; }

        // Relaciones
        public ICollection<RolPermiso> RolPermisos { get; set; }
    }
}
