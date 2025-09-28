using MediatR;
using System.Collections.Generic;

namespace SIGO.Application.Features.Roles.Commands.Update
{
    public class UpdateRolCommand : IRequest<bool>
    {
        public int RolId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public List<int> PermisosIds { get; set; } = new();
    }
}
