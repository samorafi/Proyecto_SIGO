using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Api.Attributes;
using SIGO.Application.Common.Pagination;
using SIGO.Application.Features.Ofertas.Commands.ArchivarPorModalidad;
using SIGO.Application.Features.Ofertas.Commands.Create;
using SIGO.Application.Features.Ofertas.Commands.Duplicar;
using SIGO.Application.Features.Ofertas.Commands.ImportarOfertasPresenciales;
using SIGO.Application.Features.Ofertas.Commands.Update;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;
using SIGO.Application.Features.Ofertas.Queries;
using SIGO.Application.Services;
using System.Text.Json;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OfertasController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IAuditService _auditService;
    public OfertasController(IMediator mediator, IAuditService auditService)
    {
        _mediator = mediator;
        _auditService = auditService;
    }

    // API ANTIGUA
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OfertaResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllOfertasQuery(), ct));
    

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<OfertaResponseDto>>> GetPaged(
        [FromQuery] OfertaCategory category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,

        [FromQuery] string? buscar = null,
        [FromQuery] int? sedeId = null,
        [FromQuery] int? modalidadId = null,
        [FromQuery] int? periodoId = null,
        [FromQuery] string? dia = null,
        [FromQuery] int? horarioId = null,
        [FromQuery] int? accionId = null,
        [FromQuery] int? estadoOfertaId = null,


        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetOfertasPagedQuery(category, page, pageSize)
            {
                Buscar = buscar,
                SedeId = sedeId,
                ModalidadId = modalidadId,
                PeriodoId = periodoId,
                Dia = dia,
                HorarioId = horarioId,
                AccionId = accionId,
                EstadoOfertaId = estadoOfertaId,
            }, ct);
        return Ok(result);
    }

    // Resumen de estados de las ofertas
    [HttpGet("summary")]
    public async Task<ActionResult<OfertasSummaryDto>> GetSummary(
    [FromQuery] OfertaCategory category,
    CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOfertasSummaryQuery(category), ct);
        return Ok(result);
    }


    [HttpGet("{id:int}")]
    public async Task<ActionResult<OfertaResponseDto>> GetById(int id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOfertaByIdQuery(id), ct));

    [HttpPost]
    [AuditDisabled]
    public async Task<ActionResult<int>> Create([FromBody] CreateOfertaRequest body, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateOfertaCommand(body), ct);

        var json = JsonSerializer.Serialize(body);
        await _auditService.LogManualAsync(
            usuario: User?.Identity?.Name ?? "Anon",
            tabla: "Ofertas",
            accion: "Create",
            registroId: id,
            oldValues: null,
            newValues: json,
            ip: HttpContext.Connection.RemoteIpAddress?.ToString(),
            desc: "Creación de oferta"
        );

        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:int}")]
    [AuditDisabled]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOfertaRequest body, CancellationToken ct)
    {
        // Obtener datos antes de actualizar
        var oldData = await _mediator.Send(new GetOfertaByIdQuery(id), ct);

        await _mediator.Send(new UpdateOfertaCommand(id, body), ct);

        // Serializar antes y después
        var oldJson = JsonSerializer.Serialize(oldData);
        var newJson = JsonSerializer.Serialize(body);

        await _auditService.LogManualAsync(
            usuario: User?.Identity?.Name ?? "Anon",
            tabla: "Ofertas",
            accion: "Update",
            registroId: id,
            oldValues: oldJson,
            newValues: newJson,
            ip: HttpContext.Connection.RemoteIpAddress?.ToString(),
            desc: "Actualización de oferta"
        );

        return NoContent();
    }

    // Archivar ofertas
    [HttpPost("archivar-por-modalidad")]
    public async Task<IActionResult> ArchivarPorModalidad([FromBody] ArchivarOfertasPorModalidadCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("duplicar")]
    public async Task<IActionResult> Duplicar([FromBody] DuplicarOfertasCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("importar-presencial")]
    [AuditDisabled] // Opcional: Desactiva auditoría automática fila por fila para mejorar rendimiento
    public async Task<IActionResult> ImportarPresencial([FromForm] ImportarOfertasPresencialesCommand command)
    {
        // El 'command' ya incluye el IFormFile ArchivoExcel
        // El PeriodoId se calculará internamente en el Handler leyendo la columna "Oferta Cuatrimestre"
        // Pero si decides enviarlo desde el front como backup, asegúrate de tener la propiedad en el Command.

        var response = await _mediator.Send(command);

        if (response.Errores.Any())
        {
            // Si hubo rebote (errores de validación), retornamos 400 Bad Request con la lista
            return BadRequest(response);
        }

        // Si todo salió bien
        return Ok(response);
    }

}
