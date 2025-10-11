using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Carreras.Commands.Create;
using SIGO.Application.Features.Carreras.Commands.Update;
using SIGO.Application.Features.Carreras.Dto;
using SIGO.Application.Features.Carreras.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/carreras")]
public class CarrerasController : ControllerBase
{
    private readonly IMediator _mediator;
    public CarrerasController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CarreraResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetCarreraByIdQuery(id), ct);
        return dto is null ? NotFound(new { message = $"No se encontró la carrera con id {id}." }) : Ok(dto);
    }

    [HttpGet]
    public async Task<ActionResult<List<CarreraResponseDto>>> GetAll([FromQuery] bool? estado, CancellationToken ct)
        => Ok(await _mediator.Send(new GetCarrerasQuery(estado), ct));

    [HttpPost]
    public async Task<ActionResult<CarreraResponseDto>> Create([FromBody] CreateCarreraRequest body, CancellationToken ct)
    {
        try
        {
            var created = await _mediator.Send(new CreateCarreraCommand(body), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.CarreraId }, created);
        }
        catch (AppValidationException ex) { return BadRequest(new { errors = ex.Errors }); }
        catch (DbUpdateException ex) { return StatusCode(500, new { message = "Error al guardar la carrera.", detail = ex.InnerException?.Message ?? ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CarreraResponseDto>> Update(int id, [FromBody] UpdateCarreraRequest body, CancellationToken ct)
    {
        try
        {
            var updated = await _mediator.Send(new UpdateCarreraCommand(id, body), ct);
            if (updated is null) return NotFound(new { message = $"No se encontró la carrera con id {id}." });
            return Ok(updated);
        }
        catch (AppValidationException ex) { return BadRequest(new { errors = ex.Errors }); }
        catch (DbUpdateException ex) { return StatusCode(500, new { message = "Error al guardar la carrera.", detail = ex.InnerException?.Message ?? ex.Message }); }
    }
}
