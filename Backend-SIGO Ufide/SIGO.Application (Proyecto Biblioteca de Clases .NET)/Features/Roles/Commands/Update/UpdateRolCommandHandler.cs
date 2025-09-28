using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Roles.Commands.Update
{
    public class UpdateRolCommandHandler : IRequestHandler<UpdateRolCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateRolCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateRolCommand request, CancellationToken cancellationToken)
        {
            var rol = await _context.Roles.FirstOrDefaultAsync(r => r.RolId == request.RolId, cancellationToken);
            if (rol == null) return false;

            rol.Nombre = request.Nombre;

            // Eliminar permisos actuales
            var permisosExistentes = _context.RolPermisos.Where(rp => rp.RolId == request.RolId);
            _context.RolPermisos.RemoveRange(permisosExistentes);

            // Asignar nuevos permisos
            foreach (var permisoId in request.PermisosIds)
            {
                _context.RolPermisos.Add(new Domain.Entities.RolPermiso
                {
                    RolId = rol.RolId,
                    PermisoId = permisoId
                });
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
