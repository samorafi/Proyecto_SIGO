using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Api.Attributes;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Autenticacion.Credenciales;
using SIGO.Application.Features.Autenticacion.Login;
using SIGO.Application.Features.Autenticacion.PasswordReset.Confirm;
using SIGO.Application.Features.Autenticacion.PasswordReset.RequestOtp;
using SIGO.Application.Features.Autenticacion.PasswordReset.VerifyOtp;
using SIGO.Application.Features.Autenticacion.UnlockUsers.Commands;
using SIGO.Application.Features.Autenticacion.UnlockUsers.Queries;
using System.Security.Claims;

namespace SIGO.Api.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class AutenticacionController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IApplicationDbContext _context;
        private readonly IHashService _hashService;
        private readonly ILogger<AutenticacionController> _logger;

        public AutenticacionController(IMediator mediator, IApplicationDbContext context, IHashService hashService, ILogger<AutenticacionController> logger)
        {
            _mediator = mediator;
            _context = context;
            _hashService = hashService;
            _logger = logger;
        }

        //EndPoint: Login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            var usuario = await _mediator.Send(command);

            if (usuario == null)
                return Unauthorized(new { message = "Credenciales inválidas" });

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.UsuarioId.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nombre),
                new Claim(ClaimTypes.Email, usuario.Correo)
            };

            var identity = new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults.AuthenticationScheme);

            var principal = new ClaimsPrincipal(identity);

            var authProperties = new AuthenticationProperties
            {
                IsPersistent = false,
            };

            await HttpContext.SignOutAsync();

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                authProperties);

            return Ok(usuario);
        }

        // EndPoint: Perfil -> Redirige a la pantalla principal del Front
        [Authorize]
        [HttpGet("perfil")]
        public IActionResult GetPerfil()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Sesión inválida." });

            var nombre = User.FindFirstValue(ClaimTypes.Name);
            var correo = User.FindFirstValue(ClaimTypes.Email);

            return Ok(new
            {
                usuarioId = userId,
                nombre,
                correo
            });
        }

        // EndPoint: Cierre de sesión
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logout exitoso" });
        }

        // EndPoint: Actualizar Contraseña - Desde administración del sistema del FrontEnd
        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpPost("updatePassword")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordCommand request, CancellationToken cancellationToken)
        {
            if (request.UsuarioId <= 0)
                return BadRequest(new { message = "UsuarioId inválido." });

            if (string.IsNullOrWhiteSpace(request.Contrasena) || request.Contrasena.Length < 8)
                return BadRequest(new { message = "La contraseña debe tener al menos 8 caracteres." });

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.UsuarioId == request.UsuarioId, cancellationToken);

            if (usuario == null || !usuario.Activo)
                return NotFound(new { message = "Usuario no encontrado o inactivo." });

            usuario.PasswordHash = _hashService.HashPassword(request.Contrasena);
            usuario.AccessFailedCount = 0;
            usuario.LockoutEnd = null;

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Contraseña actualizada correctamente." });
        }

        // Endpoint: Solicitud de reseteo de contraseña -> Desde Login
        [AllowAnonymous]
        [HttpPost("password-reset/request")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordResetDto dto, CancellationToken ct)
        {
            var result = await _mediator.Send(new RequestPasswordResetOtpCommand(dto.Correo), ct);

            // result trae: Sent, Message, CooldownSeconds
            return Ok(result);
        }

        // Endpoint para verificar OTP
        [AllowAnonymous]
        [HttpPost("password-reset/verify")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyPasswordResetDto dto, CancellationToken ct)
        {
            var result = await _mediator.Send(new VerifyPasswordResetOtpCommand(dto.Correo, dto.Otp), ct);

            if (result == null)
                return BadRequest(new { message = "Código inválido o expirado." });

            return Ok(result); // ResetTokenDto
        }

        // Endpoint confirmar nueva contraseña
        [AllowAnonymous]
        [HttpPost("password-reset/confirm")]
        public async Task<IActionResult> ConfirmReset([FromBody] ConfirmPasswordResetDto dto, CancellationToken ct)
        {
            var success = await _mediator.Send(new ConfirmPasswordResetCommand(dto.ResetToken, dto.NewPassword), ct);

            if (!success)
                return BadRequest(new { message = "Token inválido o expirado." });

            return Ok(new { message = "Contraseña actualizada correctamente." });
        }

        // EndPoint: Manejo de acceso sin autorización
        [AllowAnonymous]
        [HttpGet("unauthorized")]
        public IActionResult UnauthorizedHandler()
        {
            return Unauthorized(new { message = "Sesión expirada o no autorizado." });
        }

        // EndPoint: Obtener usuarios bloqueados
        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpGet("bloqueados")]
        public async Task<IActionResult> GetBloqueados()
        {
            var usuarios = await _mediator.Send(new GetLockedUsersQuery());
            return Ok(usuarios);
        }

        // EndPoint: Desbloquear usuarios
        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpPost("desbloquear")]
        public async Task<IActionResult> Desbloquear([FromBody] UnlockUserCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
