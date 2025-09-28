using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Roles.Commands.RemoveFromUser
{
    public class RemoveRoleFromUserCommandHandler : IRequestHandler<RemoveRoleFromUserCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public RemoveRoleFromUserCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(RemoveRoleFromUserCommand request, CancellationToken cancellationToken)
        {
            var usuarioRol = await _context.UsuarioRoles
                .FirstOrDefaultAsync(
                    ur => ur.UsuarioId == request.UsuarioId && ur.RolId == request.RolId,
                    cancellationToken);

            if (usuarioRol == null) return false;

            _context.UsuarioRoles.Remove(usuarioRol);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
