using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Roles.Commands.Delete
{
    public class DeleteRolCommandHandler : IRequestHandler<DeleteRolCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteRolCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteRolCommand request, CancellationToken cancellationToken)
        {
            var rol = await _context.Roles
                .FirstOrDefaultAsync(r => r.RolId == request.RolId, cancellationToken);

            if (rol == null) return false;

            // 1) Desasignar el rol de todos los usuarios (usuario_rol)
            var usuarioRoles = _context.UsuarioRoles.Where(ur => ur.RolId == rol.RolId);
            _context.UsuarioRoles.RemoveRange(usuarioRoles);

            // 2) Eliminar permisos relacionados (rol_permiso)
            var permisos = _context.RolPermisos.Where(rp => rp.RolId == rol.RolId);
            _context.RolPermisos.RemoveRange(permisos);

            // 3) Eliminar el rol
            _context.Roles.Remove(rol);

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
