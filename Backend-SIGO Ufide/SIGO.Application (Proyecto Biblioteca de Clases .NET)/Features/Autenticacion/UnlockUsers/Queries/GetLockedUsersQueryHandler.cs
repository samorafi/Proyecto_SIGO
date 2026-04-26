using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Autenticacion.UnlockUsers.DTO;

namespace SIGO.Application.Features.Autenticacion.UnlockUsers.Queries
{
    public class GetLockedUsersQueryHandler
        : IRequestHandler<GetLockedUsersQuery, List<LockedUserDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetLockedUsersQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<LockedUserDto>> Handle(
            GetLockedUsersQuery request,
            CancellationToken cancellationToken)
        {
            return await _context.Usuarios
                .AsNoTracking()
                .Where(u =>
                    u.LockoutEnd != null &&
                    u.LockoutEnd > DateTimeOffset.UtcNow)
                .OrderByDescending(u => u.LockoutEnd)
                .Select(u => new LockedUserDto
                {
                    UsuarioId = u.UsuarioId,
                    Nombre = u.Nombre,
                    Correo = u.Correo,
                    AccessFailedCount = u.AccessFailedCount,
                    LockoutEnd = u.LockoutEnd
                })
                .ToListAsync(cancellationToken);
        }
    }
}