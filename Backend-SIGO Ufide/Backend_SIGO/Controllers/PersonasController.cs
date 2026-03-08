using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Docentes.Commands.ImportarDocentes;
using SIGO.Application.Features.Docentes.Dto;
using SIGO.Application.Features.Persona.Commands.Create;
using SIGO.Application.Features.Persona.Commands.Update;
using SIGO.Application.Features.Persona.Queries.GetAll;
using SIGO.Application.Features.Persona.Queries.GetById;
using SIGO.Application.Features.Personas.Dto;
using SIGO.Application.Features.Personas.Queries;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/personas")]
    public class PersonasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PersonasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(CreatePersonaCommand command)
        {
            var personaId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = personaId }, new { id = personaId });
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var personas = await _mediator.Send(new GetAllPersonasQuery());
            return Ok(personas);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetPersonaByIdQuery { Id = id };
            var persona = await _mediator.Send(query);
            return persona != null ? Ok(persona) : NotFound();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePersonaCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("El ID de la ruta no coincide con el ID del cuerpo de la solicitud.");
            }
            await _mediator.Send(command);
            return NoContent();
        }


        [Authorize]
        [HttpGet("coordinadores")]
        public async Task<ActionResult<List<CoordinadorResponseDto>>> GetCoordinadores(
            [FromQuery] bool soloActivas = true,
            CancellationToken ct = default)
        {
            var list = await _mediator.Send(new GetCoordinadoresQuery(soloActivas), ct);
            return Ok(list);
        }

        [HttpPost("importar")]
        [ProducesResponseType(typeof(ImportarDocentesResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        public async Task<IActionResult> Importar([FromForm] ImportarDocentesCommand command)
        {
            var response = await _mediator.Send(command);

            return Ok(response);
        }
    }
}