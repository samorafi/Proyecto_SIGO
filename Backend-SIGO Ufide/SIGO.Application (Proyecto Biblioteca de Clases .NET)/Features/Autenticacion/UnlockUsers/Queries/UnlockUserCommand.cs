using MediatR;
using SIGO.Application.Features.Autenticacion.UnlockUsers.DTO;

namespace SIGO.Application.Features.Autenticacion.UnlockUsers.Commands
{
    public class UnlockUserCommand : IRequest<UnlockUserResponse>
    {
        public List<int> UsuarioIds { get; set; } = new();
    }
}