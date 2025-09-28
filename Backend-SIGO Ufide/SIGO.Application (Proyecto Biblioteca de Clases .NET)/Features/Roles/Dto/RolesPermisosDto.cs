using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Roles.Dto
{
    public class RolesPermisosDto
    {
        public List<string> Roles { get; set; } = new();
        public List<string> Permisos { get; set; } = new();
    }
}
