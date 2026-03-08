using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.RolesDocente.Dto;
using SIGO.Application.Features.RolesDocente.Queries;

namespace SIGO.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/rol-docentes")]
public class RolesDocenteController : ControllerBase
{
    private readonly IMediator _mediator;
    public RolesDocenteController(IMediator mediator) => _mediator = mediator;

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<RolDocenteResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetRolesDocenteQuery(), ct));

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RolDocenteResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetRolDocenteByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró el rol_docente con id {id}." })
            : Ok(dto);
    }
}
