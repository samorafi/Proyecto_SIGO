using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Usuarios.Commands.Create;
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
            return Ok(new { Id = userId, Message = "Usuario creado con éxito" });
        }
    }
}
