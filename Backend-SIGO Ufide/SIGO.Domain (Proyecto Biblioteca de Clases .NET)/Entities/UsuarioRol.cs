using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    public class UsuarioRol
    {
        public int UsuarioId { get; set; }
        public int RolId { get; set; }

        public Usuario Usuario { get; set; }
        public Rol Rol { get; set; }
    }
}
