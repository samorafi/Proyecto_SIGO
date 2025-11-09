using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.EstadoOfertas.Dto;
using SIGO.Application.Features.EstadoOfertas.Queries.GetAll;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class EstadoOfertasController : ControllerBase
{
    private readonly IMediator _mediator;
    public EstadoOfertasController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EstadoOfertaResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllEstadoOfertasQuery(), ct));
}
