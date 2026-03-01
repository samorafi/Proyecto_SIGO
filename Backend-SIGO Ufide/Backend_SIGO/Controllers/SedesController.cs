using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Sedes.Dto;
using SIGO.Application.Features.Sedes.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/sedes")]
public class SedesController : ControllerBase
{
    private readonly IMediator _mediator;
    public SedesController(IMediator mediator) => _mediator = mediator;

    // GET api/sedes
    [HttpGet]
    public async Task<ActionResult<List<SedeResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetSedesQuery(), ct));

    // GET api/sedes/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SedeResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetSedeByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró la sede con id {id}." })
            : Ok(dto);
    }
}
