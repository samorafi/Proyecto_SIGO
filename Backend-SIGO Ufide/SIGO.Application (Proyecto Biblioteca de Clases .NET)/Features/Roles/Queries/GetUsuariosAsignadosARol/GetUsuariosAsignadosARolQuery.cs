using MediatR;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetUsuariosAsignadosARol
{
    public record GetUsuariosAsignadosARolQuery(int RolId) : IRequest<List<UsuarioAsignadoRolDto>>;
}
