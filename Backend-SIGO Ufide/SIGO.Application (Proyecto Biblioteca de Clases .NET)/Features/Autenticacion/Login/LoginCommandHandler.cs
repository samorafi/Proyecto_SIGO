using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Usuarios.Dto;

namespace SIGO.Application.Features.Autenticacion.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, UsuarioDto?>
    {
        private readonly IApplicationDbContext _context;
        private readonly IHashService _hashService;

        public LoginCommandHandler(IApplicationDbContext context, IHashService hashService)
        {
            _context = context;
            _hashService = hashService;
        }

        public async Task<UsuarioDto?> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var correo = request.Correo.Trim().ToLower();

            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo, cancellationToken);

            if (user != null && !user.Activo)
            {
                return null;
            }

            if (user != null && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
            {
                return null;
            }

            if (user == null || !_hashService.VerifyPassword(request.Contrasena, user.PasswordHash))
            {
                if (user != null && user.LockoutEnabled)
                {
                    user.AccessFailedCount++;

                    if (user.AccessFailedCount >= 3)
                    {
                        user.LockoutEnd = DateTimeOffset.UtcNow.AddMinutes(5);
                    }

                    await _context.SaveChangesAsync(cancellationToken);
                }

                return null;
            }

            if (user.AccessFailedCount > 0)
            {
                user.AccessFailedCount = 0;
                user.LockoutEnd = null;
                await _context.SaveChangesAsync(cancellationToken);
            }

            return new UsuarioDto(user.UsuarioId, user.Nombre, user.Correo, user.Activo);
        }
    }
}
