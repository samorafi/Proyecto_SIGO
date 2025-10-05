using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Autenticacion.Credenciales;
using SIGO.Application.Features.Autenticacion.Login; 
using SIGO.Application.Features.Usuarios.Dto;
using SIGO.Domain.Entities;
using System.Security.Claims;
using System.Threading;

namespace SIGO.Api.Controllers {

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
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            // Validamos la entrada de datos (No admitir nulos o vacíos)
            if (command == null || string.IsNullOrWhiteSpace(command.Correo) || string.IsNullOrWhiteSpace(command.Contrasena))
                return BadRequest(new { message = "Correo y contraseña son requeridos." });
            UsuarioDto? usuario = null;

            try
            {
                usuario = await _mediator.Send(command);
            }
            catch (Exception)
            {
                return Unauthorized(new { message = "Credenciales inválidas." });
            }

            if (usuario == null)
                return Unauthorized(new { message = "Credenciales inválidas." });

            // Crear claim para el cookie de autenticación
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.UsuarioId.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Email, usuario.Correo),
            new Claim(ClaimTypes.Role, "Admin")
        };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity));

            return Ok(usuario);
        }

        // EndPoint: Perfil
        [Authorize] // Solo es accesible si hay un cookie VÁLIDO y ACTIVO
        [HttpGet("perfil")]
        public IActionResult GetPerfil()
        {
            // Accede a los Claims guardados en el cookie
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var nombre = User.FindFirstValue(ClaimTypes.Name);
            var correo = User.FindFirstValue(ClaimTypes.Email);
            var rol = User.FindFirstValue(ClaimTypes.Role);

            // Retorna la data que el frontend necesita para rehidratar el AuthContext
            return Ok(new
            {
                usuarioId = userId,
                nombre = nombre,
                correo = correo,
                rol = rol
            });
        }

        // EndPoint: Cierre de sesión
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            // Cierra la sesión del servidor y pide al navegador eliminar el cookie
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { Message = "Logout exitoso" });
        }

        // En caso que no tenga autorización
        [HttpGet("unauthorized")]
        public IActionResult UnauthorizedHandler()
        {
            return Unauthorized(new { Message = "Sesión expirada o no autorizado." });
        }

        // EndPoint: Actualizar Contraseña
        [HttpPost ("updatePassword")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordCommand command)
        {

            // Validaciones básicas
            if (command == null)
                return BadRequest(new { message = "Request body vacío." });

            if (command.UsuarioId <= 0)
                return BadRequest(new { message = "UsuarioId inválido." });

            if (string.IsNullOrWhiteSpace(command.Contrasena))
                return BadRequest(new { message = "La contraseña no puede estar vacía." });

            if (command.Contrasena.Length < 8)
                return BadRequest(new { message = "La contraseña debe tener al menos 8 caracteres." });

            try
            {
                var actualizado = await _mediator.Send(command);

                if (!actualizado)
                {
                    // handler devolvió false => usuario no encontrado o no se actualizó
                    return NotFound(new { message = "Usuario no encontrado o no se pudo actualizar la contraseña." });
                }

                return Ok(new { success = true, message = "Contraseña actualizada correctamente." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la contraseña para usuario {UsuarioId}", command.UsuarioId);
                // No devuelvas el stacktrace en producción
                return StatusCode(500, new { message = "Error interno al actualizar la contraseña." });
            }

        }
    }
}
