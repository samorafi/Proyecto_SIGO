using System.Collections.Generic;

namespace SIGO.Domain.Entities
{
    public class Provincia
    {
        public int ProvinciaId { get; set; }
        public string Nombre { get; set; } = string.Empty;

        // Propiedad de navegación que faltaba: Una provincia tiene una colección de cantones.
        public virtual ICollection<Canton> Cantones { get; set; } = new List<Canton>();
    }
}