using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    [Table("rol", Schema = "public")]
    public class Rol
    {
        [Key]
        [Column("rol_id")]
        public int RolId { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        // Relaciones
        public ICollection<UsuarioRol> UsuarioRoles { get; set; }
        public ICollection<RolPermiso> RolPermisos { get; set; }
    }
}
