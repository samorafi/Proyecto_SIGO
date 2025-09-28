using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Roles.Dto
{
    public class RolDto
    {
        public int RolId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public List<string> Permisos { get; set; } = new();
    }
}

