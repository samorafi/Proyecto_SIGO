using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Usuarios.Commands.Create;
using SIGO.Application.Features.Usuarios.Queries.GetAll;
using SIGO.Application.Features.Usuarios.Queries.GetId;
using SIGO.Application.Features.Usuarios.Dto;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsuariosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var usuarios = await _mediator.Send(new GetUsuariosQuery());
            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUsuarioCommand command)
        {
            var userId = await _mediator.Send(command);
            return Ok(new { Id = userId, Message = "Usuario creado con éxito" });
        }

        // Endpoint: Tipo Post - Funcionalidad: Login de usuario
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Correo) || string.IsNullOrWhiteSpace(request.Contrasena))
                return BadRequest(new { message = "Correo y contraseña son requeridos." });

            var usuario = await _mediator.Send(new PostUsuarioLoginQuery(request.Correo, request.Contrasena));

            if (usuario == null)
                return Unauthorized(new { message = "Credenciales inválidas." });

            // Aquí podrías emitir JWT. Por ahora devolvemos el DTO (sin contraseña).
            return Ok(usuario);
        }
    }
}
