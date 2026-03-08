using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Sedes.Dto;
using SIGO.Application.Features.Sedes.Queries;

namespace SIGO.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/sedes")]
public class SedesController : ControllerBase
{
    private readonly IMediator _mediator;
    public SedesController(IMediator mediator) => _mediator = mediator;

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<SedeResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetSedesQuery(), ct));

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SedeResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetSedeByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró la sede con id {id}." })
            : Ok(dto);
    }
}
