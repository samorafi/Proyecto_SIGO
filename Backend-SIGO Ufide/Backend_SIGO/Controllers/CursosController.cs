using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Cursos.Commands.Create;
using SIGO.Application.Features.Cursos.Commands.Update;
using SIGO.Application.Features.Cursos.Dto;
using SIGO.Application.Features.Cursos.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/cursos")]
public class CursosController : ControllerBase
{
    private readonly IMediator _mediator;
    public CursosController(IMediator mediator) => _mediator = mediator;

    // POST api/cursos
    [HttpPost]
    public async Task<ActionResult<CursoResponseDto>> Create([FromBody] CreateCursoRequest body, CancellationToken ct)
    {
        try
        {
            var created = await _mediator.Send(new CreateCursoCommand(body), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.CursoId }, created);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar el curso.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    // PUT api/cursos/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CursoResponseDto>> Update(int id, [FromBody] UpdateCursoRequest body, CancellationToken ct)
    {
        try
        {
            var updated = await _mediator.Send(new UpdateCursoCommand(id, body), ct);
            if (updated is null)
                return NotFound(new { message = $"No se encontró el curso con id {id}." });

            return Ok(updated);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar el curso.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    // GET api/cursos/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CursoResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetCursoByIdQuery(id), ct);
        return dto is null ? NotFound(new { message = $"No se encontró el curso con id {id}." }) : Ok(dto);
    }

    // GET api/cursos?estado=true|false (si omites 'estado', trae todos)
    [HttpGet]
    public async Task<ActionResult<List<CursoResponseDto>>> GetAll([FromQuery] bool? estado, CancellationToken ct)
    {
        var list = await _mediator.Send(new GetCursosQuery(estado), ct);
        return Ok(list);
    }
}
