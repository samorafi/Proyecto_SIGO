using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Persona.Commands.Delete;
using SIGO.Application.Features.Persona.Commands.Update;
using SIGO.Application.Features.Persona.Queries.GetAll;
using SIGO.Application.Features.Persona.Queries.GetById;
using SIGO.Application.Features.Personas.Commands.Create;
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
            // Devuelve 201 Created y la ruta para obtener el nuevo recurso
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
            // Si la persona no se encuentra, devuelve 404 Not Found
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
            // Devuelve 204 No Content, la respuesta estándar para un PUT exitoso
            return NoContent();
        }

        // DELETE: api/personas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _mediator.Send(new DeletePersonaCommand { Id = id });
            // Si el resultado es true, la desactivación fue exitosa (204 No Content).
            // Si es false, no se encontró la persona (404 Not Found).
            return result ? NoContent() : NotFound();
        }
    }
}