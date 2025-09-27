using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    [Table("usuario_rol", Schema = "public")]
    public class UsuarioRol
    {
        [Key, Column("usuario_id", Order = 0)]
        public int UsuarioId { get; set; }

        [Key, Column("rol_id", Order = 1)]
        public int RolId { get; set; }

        //[ForeignKey("UsuarioId")]
        //public Usuario Usuario { get; set; }

        [ForeignKey("RolId")]
        public Rol Rol { get; set; }
    }
}
