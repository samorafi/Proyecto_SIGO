using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.AccionesOferta.Dto;
using SIGO.Application.Features.AccionesOferta.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/acciones-oferta")]
public class AccionesOfertaController : ControllerBase
{
    private readonly IMediator _mediator;
    public AccionesOfertaController(IMediator mediator) => _mediator = mediator;

    // GET api/acciones-oferta
    [HttpGet]
    public async Task<ActionResult<List<AccionOfertaResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAccionesOfertaQuery(), ct));

    // GET api/acciones-oferta/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AccionOfertaResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetAccionOfertaByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró la acción de oferta con id {id}." })
            : Ok(dto);
    }
}
