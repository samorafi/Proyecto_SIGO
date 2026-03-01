using MediatR;

namespace SIGO.Application.Features.Roles.Commands.Delete
{
    public record DeleteRolCommand(int RolId) : IRequest<bool>;
}
