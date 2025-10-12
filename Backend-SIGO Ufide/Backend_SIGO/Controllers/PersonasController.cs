using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Persona.Commands.Activate;
using SIGO.Application.Features.Persona.Commands.Deactivate;
using SIGO.Application.Features.Persona.Commands.Delete;
using SIGO.Application.Features.Persona.Commands.Update;
using SIGO.Application.Features.Persona.Queries.GetAll;
using SIGO.Application.Features.Persona.Queries.GetById;
using SIGO.Application.Features.Personas.Commands.Create;
using SIGO.Application.Features.Personas.Dto;
using SIGO.Application.Features.Personas.Queries;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/personas")]
    //[Authorize] // Toda la gestión de personas requiere autorización
    public class PersonasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PersonasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/personas
        [HttpPost]
        public async Task<IActionResult> Create(CreatePersonaCommand command)
        {
            var personaId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = personaId }, new { id = personaId });
        }

        // GET: api/personas
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var personas = await _mediator.Send(new GetAllPersonasQuery());
            return Ok(personas);
        }

        // GET: api/personas/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetPersonaByIdQuery { Id = id };
            var persona = await _mediator.Send(query);
            return persona != null ? Ok(persona) : NotFound();
        }

        // PUT: api/personas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePersonaCommand command)
        {
            // Verificación para asegurar que el ID de la ruta coincida con el del cuerpo
            if (id != command.Id)
            {
                return BadRequest("El ID de la ruta no coincide con el ID del cuerpo de la solicitud.");
            }
            await _mediator.Send(command);
            return NoContent();
        }

        // DELETE: api/personas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _mediator.Send(new DeletePersonaCommand { Id = id });
            return result ? NoContent() : NotFound();
        }

        // PUT: api/Personas/5/inactivar
        [HttpPut("{id}/inactivar")]
        public async Task<IActionResult> Inactivar(int id, [FromBody] DeactivatePersonaCommand command)
        {
            // Asegurarnos de que el ID de la ruta y el del comando coinciden
            command.Id = id;

            var result = await _mediator.Send(command);

            return result ? NoContent() : NotFound();
        }

        // PUT: api/Personas/5/activate
        [HttpPut("{id}/activate")]
        public async Task<IActionResult> Activate(int id)
        {
            var command = new ActivatePersonaCommand { Id = id };
            var result = await _mediator.Send(command);
            return result ? NoContent() : NotFound();
        }

        // GET api/personas/coordinadores?soloActivas=true
        [HttpGet("coordinadores")]
        public async Task<ActionResult<List<CoordinadorResponseDto>>> GetCoordinadores(
            [FromQuery] bool soloActivas = true,
            CancellationToken ct = default)
        {
            var list = await _mediator.Send(new GetCoordinadoresQuery(soloActivas), ct);
            return Ok(list);
        }
    }
}