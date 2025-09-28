using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Roles.Commands.AssignToUser
{
    public class AssignRoleToUserCommandHandler : IRequestHandler<AssignRoleToUserCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public AssignRoleToUserCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(AssignRoleToUserCommand request, CancellationToken cancellationToken)
        {
            // Verificar existencia de usuario
            var usuarioExists = await _context.Usuarios.AnyAsync(u => u.UsuarioId == request.UsuarioId, cancellationToken);
            if (!usuarioExists) return false;

            // Verificar existencia de rol
            var rolExists = await _context.Roles.AnyAsync(r => r.RolId == request.RolId, cancellationToken);
            if (!rolExists) return false;

            // Evitar duplicados
            var alreadyAssigned = await _context.UsuarioRoles
                .AnyAsync(ur => ur.UsuarioId == request.UsuarioId && ur.RolId == request.RolId, cancellationToken);

            if (alreadyAssigned) return true; // ya existe

            // Crear relación
            var usuarioRol = new UsuarioRol
            {
                UsuarioId = request.UsuarioId,
                RolId = request.RolId
            };

            _context.UsuarioRoles.Add(usuarioRol);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
