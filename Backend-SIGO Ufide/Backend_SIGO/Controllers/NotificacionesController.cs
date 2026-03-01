using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Notificaciones.Commands.Crear;
using SIGO.Application.Features.Notificaciones.Commands.MarcarLeida;
using SIGO.Application.Features.Notificaciones.Commands.MarcarTodasLeidas;
using SIGO.Application.Features.Notificaciones.Queries.CountNoLeidas;
using SIGO.Application.Features.Notificaciones.Queries.Listar;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificacionesController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificacionesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/Notificaciones?personaId=123&soloNoLeidas=true&search=hola&page=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<GetNotificacionesResponse>> Listar(
        [FromQuery] GetNotificacionesQuery query,
        CancellationToken ct)
    {
        try
        {
            var resp = await _mediator.Send(query, ct);
            return Ok(resp);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/Notificaciones/count-no-leidas?personaId=123
    [HttpGet("count-no-leidas")]
    public async Task<ActionResult<int>> CountNoLeidas([FromQuery] int? personaId, CancellationToken ct)
    {
        var count = await _mediator.Send(new GetNotificacionesNoLeidasCountQuery(personaId), ct);
        return Ok(count);
    }

    // POST /api/Notificaciones
    [HttpPost]
    public async Task<ActionResult<int>> Crear(
        [FromBody] CrearNotificacionRequest request,
        CancellationToken ct)
    {
        if (request is null)
            return BadRequest("Los datos de la notificación son requeridos.");

        try
        {
            var id = await _mediator.Send(new CrearNotificacionCommand(request), ct);
            return Ok(id);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PATCH /api/Notificaciones/123/leida
    [HttpPatch("{id:int}/leida")]
    public async Task<IActionResult> MarcarLeida(
        [FromRoute] int id,
        CancellationToken ct)
    {
        var ok = await _mediator.Send(new MarcarNotificacionLeidaCommand(id), ct);
        return ok ? Ok() : NotFound();
    }

    // PATCH /api/Notificaciones/leidas
    [HttpPatch("leidas")]
    public async Task<ActionResult<int>> MarcarTodasLeidas(CancellationToken ct)
    {
        var count = await _mediator.Send(new MarcarTodasLeidasCommand(), ct);
        return Ok(count);
    }
}
