using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Features.Ofertas.Commands.Create;
using SIGO.Application.Features.Ofertas.Commands.Update;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Queries;
using SIGO.Application.Common.Exceptions;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/ofertas")]
public class OfertasController : ControllerBase
{
    private readonly IMediator _mediator;
    public OfertasController(IMediator mediator) => _mediator = mediator;

    // Crear
    [HttpPost]
    public async Task<ActionResult<OfertaResponseDto>> Create([FromBody] CreateOfertaRequest body, CancellationToken ct)
    {
        try
        {
            var created = await _mediator.Send(new CreateOfertaCommand(body), ct);
            return CreatedAtAction(nameof(GetById), new { id = created.OfertaId }, created);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar la oferta.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    // Modificar
    [HttpPut("{id:int}")]
    public async Task<ActionResult<OfertaResponseDto>> Update(int id, [FromBody] UpdateOfertaRequest body, CancellationToken ct)
    {
        try
        {
            var updated = await _mediator.Send(new UpdateOfertaCommand(id, body), ct);
            if (updated is null)
                return NotFound(new { message = $"No se encontró la oferta con id {id}." });

            return Ok(updated);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar la oferta.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    // Ver una
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OfertaResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetOfertaByIdQuery(id), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    // Ver todas (sin filtros)
    [HttpGet]
    public async Task<ActionResult<List<OfertaResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllOfertasQuery(), ct));
}
