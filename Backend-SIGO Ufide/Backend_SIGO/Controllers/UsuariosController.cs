using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Usuarios.Commands.Create;
using SIGO.Application.Features.Usuarios.Commands.Update;
using SIGO.Application.Features.Usuarios.Queries.GetAll;

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

            if (userId == -1)
            {
                return Conflict(new { Message = "El usuario ya está registrado" });
            }

            return CreatedAtAction(nameof(Create), new { Id = userId }, new { Id = userId, Message = "Usuario creado con éxito" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUsuarioCommand command)
        {
            if (id != command.UsuarioId)
                return BadRequest("El ID de la URL no coincide con el del body.");

            var result = await _mediator.Send(command);

            if (!result)
                return NotFound(new { Message = "Usuario no encontrado" });

            return Ok(new { Message = "Usuario actualizado con éxito" });
        }
    }
}
