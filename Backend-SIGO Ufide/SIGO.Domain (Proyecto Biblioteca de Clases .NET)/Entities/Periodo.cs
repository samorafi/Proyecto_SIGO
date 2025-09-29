using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace SIGO.Domain.Entities
{
    public class Periodo
    {
        public int PeriodoId { get; set; }
        public int Anio { get; set; }
        public int Numero { get; set; }
    }

}
