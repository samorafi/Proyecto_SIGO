using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Ofertas.Commands.Create;
using SIGO.Application.Features.Ofertas.Commands.Update;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OfertasController : ControllerBase
{
    private readonly IMediator _mediator;
    public OfertasController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OfertaResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllOfertasQuery(), ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OfertaResponseDto>> GetById(int id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOfertaByIdQuery(id), ct));

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreateOfertaRequest body, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateOfertaCommand(body), ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOfertaRequest body, CancellationToken ct)
    {
        await _mediator.Send(new UpdateOfertaCommand(id, body), ct);
        return NoContent();
    }
}
