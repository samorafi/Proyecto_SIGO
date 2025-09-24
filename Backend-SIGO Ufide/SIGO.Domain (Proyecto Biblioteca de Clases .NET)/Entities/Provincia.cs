using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities
{
    [Table("provincia", Schema = "universidad")] 
    public class Provincia
    {
        [Key]
        [Column("provincia_id")]
        public int ProvinciaId { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }
    }
}
