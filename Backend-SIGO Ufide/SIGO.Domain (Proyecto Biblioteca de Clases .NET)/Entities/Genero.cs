using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Domain.Entities
{
    public class Genero
    {
        // Clave Primaria (PK)
        public int GeneroId { get; set; }
        // Propiedad para la columna 'nombre'
        public string Nombre { get; set; } = string.Empty;
    }
}
