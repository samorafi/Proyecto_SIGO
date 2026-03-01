using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetRolesPermisos
{
    public class GetRolesPermisosQueryHandler : IRequestHandler<GetRolesPermisosQuery, RolesPermisosDto>
    {
        private readonly IApplicationDbContext _context;

        public GetRolesPermisosQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RolesPermisosDto> Handle(GetRolesPermisosQuery request, CancellationToken cancellationToken)
        {
            var roles = await _context.UsuarioRoles
                .Include(ur => ur.Rol)
                .Where(ur => ur.UsuarioId == request.UsuarioId)
                .Select(ur => ur.Rol.Nombre)
                .ToListAsync(cancellationToken);

            var permisos = await _context.UsuarioRoles
                .Include(ur => ur.Rol)
                    .ThenInclude(r => r.RolPermisos)
                        .ThenInclude(rp => rp.Permiso)
                .Where(ur => ur.UsuarioId == request.UsuarioId)
                .SelectMany(ur => ur.Rol.RolPermisos.Select(rp => rp.Permiso.Clave))
                .Distinct()
                .ToListAsync(cancellationToken);

            return new RolesPermisosDto
            {
                Roles = roles,
                Permisos = permisos
            };
        }
    }
}
