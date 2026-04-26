using MediatR;
using SIGO.Application.Features.Autenticacion.UnlockUsers.DTO;

namespace SIGO.Application.Features.Autenticacion.UnlockUsers.Queries
{
    public class GetLockedUsersQuery : IRequest<List<LockedUserDto>>
    {
    }
}