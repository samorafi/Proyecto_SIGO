using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.RolesDocente.Dto;
using SIGO.Application.Features.RolesDocente.Queries;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/rol-docentes")]
public class RolesDocenteController : ControllerBase
{
    private readonly IMediator _mediator;
    public RolesDocenteController(IMediator mediator) => _mediator = mediator;

    // GET api/rol-docentes
    [HttpGet]
    public async Task<ActionResult<List<RolDocenteResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetRolesDocenteQuery(), ct));

    // GET api/rol-docentes/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RolDocenteResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetRolDocenteByIdQuery(id), ct);
        return dto is null
            ? NotFound(new { message = $"No se encontró el rol_docente con id {id}." })
            : Ok(dto);
    }
}
