using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Grados.Dto;
using SIGO.Application.Features.Grados.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/grados")]
public class GradosController : ControllerBase
{
    private readonly IMediator _mediator;
    public GradosController(IMediator mediator) => _mediator = mediator;

    // GET api/grados
    [HttpGet]
    public async Task<ActionResult<List<GradoResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetGradosQuery(), ct));

    // GET api/grados/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<GradoResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetGradoByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró el grado con id {id}." })
            : Ok(dto);
    }
}
