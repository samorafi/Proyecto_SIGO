using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Permisos.Dto;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetAllRoles
{
    public class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, List<RolDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllRolesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<RolDto>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
        {
            return await _context.Roles
                .Include(r => r.RolPermisos)
                .ThenInclude(rp => rp.Permiso)
                .Select(r => new RolDto
                {
                    RolId = r.RolId,
                    Nombre = r.Nombre,
                    Permisos = r.RolPermisos.Select(rp => new PermisoDto
                    {
                        PermisoId = rp.Permiso.PermisoId,
                        Nombre = rp.Permiso.Nombre,
                        Clave = rp.Permiso.Clave,
                        Ruta = rp.Permiso.Ruta
                    }).ToList()
                })
                .ToListAsync(cancellationToken);
        }
    }
}
