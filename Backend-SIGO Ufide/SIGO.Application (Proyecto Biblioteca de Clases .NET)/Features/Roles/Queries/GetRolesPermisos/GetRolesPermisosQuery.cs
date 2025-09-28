using MediatR;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetRolesPermisos
{
    public record GetRolesPermisosQuery(int UsuarioId) : IRequest<RolesPermisosDto>;
}
