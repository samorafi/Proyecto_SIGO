using MediatR;

namespace SIGO.Application.Features.Roles.Commands.AssignToUser
{
    public class AssignRoleToUserCommand : IRequest<bool>
    {
        public int UsuarioId { get; set; }
        public int RolId { get; set; }
    }
}
