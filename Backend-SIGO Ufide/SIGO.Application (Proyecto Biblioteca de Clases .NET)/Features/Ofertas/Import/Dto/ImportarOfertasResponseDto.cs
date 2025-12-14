using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Ofertas.Dto
{
    public class ImportarOfertasResponseDto
    {
        public int TotalProcesados { get; set; }
        public int InsertadosCorrectamente { get; set; }
        public List<string> Errores { get; set; } = new();
    }
}