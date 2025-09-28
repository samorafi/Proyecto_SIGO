using MediatR;
using System.Collections.Generic;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetAllRoles
{
    public record GetAllRolesQuery() : IRequest<List<RolDto>>;
}
