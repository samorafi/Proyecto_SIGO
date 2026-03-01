using MediatR;
using System.Collections.Generic;

namespace SIGO.Application.Features.Roles.Commands.Create
{
    public class CreateRolCommand : IRequest<int>
    {
        public string Nombre { get; set; } = string.Empty;
        public List<int> PermisosIds { get; set; } = new();
    }
}
