using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Api.Attributes;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Cursos.Commands.Create;
using SIGO.Application.Features.Cursos.Commands.Update;
using SIGO.Application.Features.Cursos.Dto;
using SIGO.Application.Features.Cursos.Queries;
using SIGO.Application.Services;
using System.Text.Json;

namespace SIGO.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/cursos")]
public class CursosController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IAuditService _auditService;
    public CursosController(IMediator mediator, IAuditService auditService)
    {
        _mediator = mediator;
        _auditService = auditService;
    }


    [Authorize]
    [HttpPost]
    [HasPermission("ADMIN_VIEW")]
    [AuditDisabled]
    public async Task<ActionResult<CursoResponseDto>> Create([FromBody] CreateCursoRequest body, CancellationToken ct)
    {
        try
        {
            var created = await _mediator.Send(new CreateCursoCommand(body), ct);

            var json = JsonSerializer.Serialize(body);
            await _auditService.LogManualAsync(
                usuario: User?.Identity?.Name ?? "Anon",
                tabla: "Cursos",
                accion: "Create",
                registroId: created.CursoId,
                oldValues: null,
                newValues: json,
                ip: HttpContext.Connection.RemoteIpAddress?.ToString(),
                desc: "Creación de curso"
            );

            return CreatedAtAction(nameof(GetById), new { id = created.CursoId }, created);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar el curso.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }


    [Authorize]
    [HasPermission("ADMIN_VIEW")]
    [HttpPut("{id:int}")]
    [AuditDisabled]
    public async Task<ActionResult<CursoResponseDto>> Update(int id, [FromBody] UpdateCursoRequest body, CancellationToken ct)
    {
        try
        {
            var oldData = await _mediator.Send(new GetCursoByIdQuery(id), ct);

            var updated = await _mediator.Send(new UpdateCursoCommand(id, body), ct);
            if (updated is null)
                return NotFound(new { message = $"No se encontró el curso con id {id}." });

            var oldJson = JsonSerializer.Serialize(oldData);
            var newJson = JsonSerializer.Serialize(body);

            await _auditService.LogManualAsync(
                usuario: User?.Identity?.Name ?? "Anon",
                tabla: "Cursos",
                accion: "Update",
                registroId: id,
                oldValues: oldJson,
                newValues: newJson,
                ip: HttpContext.Connection.RemoteIpAddress?.ToString(),
                desc: "Actualización de curso"
            );

            return Ok(updated);
        }
        catch (AppValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Error al guardar el curso.", detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CursoResponseDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _mediator.Send(new GetCursoByIdQuery(id), ct);
        return dto is null ? NotFound(new { message = $"No se encontró el curso con id {id}." }) : Ok(dto);
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<CursoResponseDto>>> GetAll([FromQuery] bool? estado, CancellationToken ct)
    {
        var list = await _mediator.Send(new GetCursosQuery(estado), ct);
        return Ok(list);
    }
}
