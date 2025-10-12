using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Periodos.Commands.Create;
using SIGO.Application.Features.Periodos.Commands.Update;
using SIGO.Application.Features.Periodos.Dto;
using SIGO.Application.Features.Periodos.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/periodos")]
public class PeriodosController : ControllerBase
{
    private readonly IMediator _mediator;
    public PeriodosController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PeriodoResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetPeriodoByIdQuery(id), ct);
        return dto is null ? NotFound(new { message = $"No se encontró el periodo con id {id}." }) : Ok(dto);
    }

    [HttpGet]
    public async Task<ActionResult<List<PeriodoResponseDto>>> GetAll([FromQuery] bool? estado, CancellationToken ct)
        => Ok(await _mediator.Send(new GetPeriodosQuery(estado), ct));

    [HttpPost]
    public async Task<ActionResult<PeriodoResponseDto>> Create([FromBody] CreatePeriodoRequest body, CancellationToken ct)
    {
        try
        {
            var created = await _mediator.Send(new CreatePeriodoCommand(body), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.PeriodoId }, created);
        }
        catch (AppValidationException ex) { return BadRequest(new { errors = ex.Errors }); }
        catch (DbUpdateException ex) { return StatusCode(500, new { message = "Error al guardar el periodo.", detail = ex.InnerException?.Message ?? ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PeriodoResponseDto>> Update(int id, [FromBody] UpdatePeriodoRequest body, CancellationToken ct)
    {
        try
        {
            var updated = await _mediator.Send(new UpdatePeriodoCommand(id, body), ct);
            if (updated is null) return NotFound(new { message = $"No se encontró el periodo con id {id}." });
            return Ok(updated);
        }
        catch (AppValidationException ex) { return BadRequest(new { errors = ex.Errors }); }
        catch (DbUpdateException ex) { return StatusCode(500, new { message = "Error al guardar el periodo.", detail = ex.InnerException?.Message ?? ex.Message }); }
    }
}
