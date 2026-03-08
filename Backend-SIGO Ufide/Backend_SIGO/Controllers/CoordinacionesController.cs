using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Api.Attributes;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Coordinaciones.Commands.Create;
using SIGO.Application.Features.Coordinaciones.Commands.Update;
using SIGO.Application.Features.Coordinaciones.Dto;
using SIGO.Application.Features.Coordinaciones.Queries;

namespace SIGO.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/coordinaciones")]
public class CoordinacionesController : ControllerBase
{
    private readonly IMediator _mediator;
    public CoordinacionesController(IMediator mediator) => _mediator = mediator;

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<CoordinacionResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetCoordinacionesQuery(), ct));

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CoordinacionResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetCoordinacionByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró la coordinación con id {id}." })
            : Ok(dto);
    }

    [Authorize]
    [HasPermission("ADMIN_VIEW")]
    [HttpPost]
    public async Task<ActionResult<CoordinacionResponseDto>> Create([FromBody] CreateCoordinacionRequest body, CancellationToken ct)
    {
        try
        {
            var created = await _mediator.Send(new CreateCoordinacionCommand(body), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.CoordinacionId }, created);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar la coordinación.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    [Authorize]
    [HasPermission("ADMIN_VIEW")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CoordinacionResponseDto>> Update(int id, [FromBody] UpdateCoordinacionRequest body, CancellationToken ct)
    {
        try
        {
            var updated = await _mediator.Send(new UpdateCoordinacionCommand(id, body), ct);
            if (updated is null)
                return NotFound(new { message = $"No se encontró la coordinación con id {id}." });

            return Ok(updated);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar la coordinación.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }
}
