using MediatR;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetRolById
{
    public record GetRolByIdQuery(int RolId) : IRequest<RolDto>;
}
