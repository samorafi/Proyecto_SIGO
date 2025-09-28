using MediatR;

namespace SIGO.Application.Features.Roles.Commands.RemoveFromUser
{
    public class RemoveRoleFromUserCommand : IRequest<bool>
    {
        public int UsuarioId { get; set; }
        public int RolId { get; set; }
    }
}
