using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Horarios.Dto;
using SIGO.Application.Features.Horarios.Queries;

namespace SIGO.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/horarios")]
public class HorariosController : ControllerBase
{
    private readonly IMediator _mediator;
    public HorariosController(IMediator mediator) => _mediator = mediator;

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<HorarioResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetHorariosQuery(), ct));

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<HorarioResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetHorarioByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró el horario con id {id}." })
            : Ok(dto);
    }
}
