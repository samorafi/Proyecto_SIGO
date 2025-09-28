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
            var rol = await _context.Roles.FirstOrDefaultAsync(r => r.RolId == request.RolId, cancellationToken);
            if (rol == null) return false;

            // Eliminar permisos relacionados
            var permisos = _context.RolPermisos.Where(rp => rp.RolId == rol.RolId);
            _context.RolPermisos.RemoveRange(permisos);

            // Eliminar el rol
            _context.Roles.Remove(rol);

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
