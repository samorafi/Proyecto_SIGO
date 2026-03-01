using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Usuarios.Dto;

namespace SIGO.Application.Features.Autenticacion.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResult>
    {
        private readonly IApplicationDbContext _context;
        private readonly IHashService _hashService;

        public LoginCommandHandler(IApplicationDbContext context, IHashService hashService)
        {
            _context = context;
            _hashService = hashService;
        }

        public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var correo = request.Correo?.Trim().ToLower();

            // 1) Buscar usuario (robusto)
            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo.Trim().ToLower() == correo, cancellationToken);

            // 2) Usuario no encontrado
            if (user == null)
            {
                return new LoginResult(false, null, LoginError.UserNotFound, "Usuario no encontrado.");
            }

            // 3) Usuario inactivo (opcional pero recomendado)
            if (!user.Activo)
            {
                return new LoginResult(false, null, LoginError.InactiveUser, "Usuario inactivo.");
            }

            // 4) Bloqueado (lockout)
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
            {
                return new LoginResult(false, null, LoginError.LockedOut,
                    $"Usuario bloqueado temporalmente hasta {user.LockoutEnd.Value:yyyy-MM-dd HH:mm:ss} UTC.");
            }

            // 5) Contraseña incorrecta
            var ok = _hashService.VerifyPassword(request.Contrasena, user.PasswordHash);
            if (!ok)
            {
                //if (user.LockoutEnabled)
                //{
                //    user.AccessFailedCount++;

                //    if (user.AccessFailedCount >= 3)
                //        user.LockoutEnd = DateTimeOffset.UtcNow.AddMinutes(5);

                //    await _context.SaveChangesAsync(cancellationToken);
                //}

                return new LoginResult(false, null, LoginError.WrongPassword, "Contraseña incorrecta.");
            }

            // 6) Si tuvo fallos, resetearlos
            if (user.AccessFailedCount > 0 || user.LockoutEnd != null)
            {
                user.AccessFailedCount = 0;
                user.LockoutEnd = null;
                await _context.SaveChangesAsync(cancellationToken);
            }

            var dto = new UsuarioDto(user.UsuarioId, user.Nombre, user.Correo, user.Activo);
            return new LoginResult(true, dto, LoginError.None, "Login exitoso.");
        }
    }
}