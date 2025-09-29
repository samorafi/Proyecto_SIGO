using MediatR;
using System.Collections.Generic;
using SIGO.Application.Features.Permisos.Dto;

namespace SIGO.Application.Features.Permisos.Queries.GetAll
{
    public record GetAllPermisosQuery() : IRequest<List<PermisoDto>>;
}
