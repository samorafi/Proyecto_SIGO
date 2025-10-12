using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Modalidades.Dto;
using SIGO.Application.Features.Modalidades.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/modalidades")]
public class ModalidadesController : ControllerBase
{
    private readonly IMediator _mediator;
    public ModalidadesController(IMediator mediator) => _mediator = mediator;

    // GET api/modalidades
    [HttpGet]
    public async Task<ActionResult<List<ModalidadResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetModalidadesQuery(), ct));

    // GET api/modalidades/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ModalidadResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetModalidadByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró la modalidad con id {id}." })
            : Ok(dto);
    }
}
