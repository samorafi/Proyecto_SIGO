using System.Collections.Generic;
using SIGO.Application.Features.Permisos.Dto;

namespace SIGO.Application.Features.Roles.Dto
{
    public class RolDto
    {
        public int RolId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public List<PermisoDto> Permisos { get; set; } = new();
    }
}
