using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Domain.Entities
{
    public class TipoContrato
    {
        public int TipoContratoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }

}
