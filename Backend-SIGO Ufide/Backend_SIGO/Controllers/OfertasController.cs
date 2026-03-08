using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Api.Attributes;
using SIGO.Application.Common.Pagination;
using SIGO.Application.Features.Ofertas.Commands.ArchivarPorModalidad;
using SIGO.Application.Features.Ofertas.Commands.Cancelar;
using SIGO.Application.Features.Ofertas.Commands.Create;
using SIGO.Application.Features.Ofertas.Commands.Duplicar;
using SIGO.Application.Features.Ofertas.Commands.ImportarOfertasPresenciales;
using SIGO.Application.Features.Ofertas.Commands.Update;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;
using SIGO.Application.Features.Ofertas.Queries.Export;
using SIGO.Application.Features.Ofertas.Queries.ObtenerOfertas;
using SIGO.Application.Features.Ofertas.Queries.ObtenerOfertasPorId;
using SIGO.Application.Features.Ofertas.Queries.ObtenerOfertasReportes;
using SIGO.Application.Features.Ofertas.Queries.ResumenEstadosOfertas;
using SIGO.Application.Services;
using SIGO.Application__Proyecto_Biblioteca_de_Clases_.NET_.Features.Ofertas.Queries.ObtenerOfertaNotificaciones;
using System.Text.Json;

namespace SIGO.Api.Controllers;

[Authorize]
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

    // Endpoint: Obtener todas las ofertas (Utilizado para reportes
    [Authorize]
    [HasPermission("REPORTES_VIEW")]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OfertaResponseDto>>> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllOfertasReporteQuery(), ct));


    // Endpoint: Obtener todas las ofertas (Filtro/Paginación)
    [Authorize]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HasPermission("export/100%-virtual")]
    [HasPermission("HISTORICO_VIEW")]
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

    // Endpoint: Total de ofertas por estado (Se utiliza en Chips)
    [Authorize]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HasPermission("export/100%-virtual")]
    [HasPermission("HISTORICO_VIEW")]
    [HttpGet("summary")]
    public async Task<ActionResult<OfertasSummaryDto>> GetSummary(
    [FromQuery] OfertaCategory category,
    CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOfertasSummaryQuery(category), ct);
        return Ok(result);
    }

    [Authorize]
    [HasPermission("NOTIFICACIONES_VIEW")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OfertaResponseDto>> GetById(int id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOfertaNotificacionesQuery(id), ct));

    /// Endpoint: Ver datos de una oferta en Ficha para Modulos de Ofertas
    [Authorize]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HasPermission("export/100%-virtual")]
    [HasPermission("HISTORICO_VIEW")]
    [HttpGet("{id:int}/ficha")]
    public async Task<ActionResult<OfertaResponseDto>> GetFicha(int id, CancellationToken ct)
    => Ok(await _mediator.Send(new GetOfertaByIdQuery(id), ct));

    // Endpoint: Crear una nueva oferta
    [Authorize]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HasPermission("export/100%-virtual")]
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

        return CreatedAtAction(nameof(GetFicha), new { id }, id);
    }

    // EndPoint: Actualizar una oferta existente
    [Authorize]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HasPermission("export/100%-virtual")]
    [HasPermission("HISTORICO_VIEW")]
    [HttpPut("{id:int}/editable")]
    [AuditDisabled]
    public async Task<IActionResult> UpdateEditable(int id, [FromBody] UpdateOfertaRequest body, CancellationToken ct)
    {
        var oldData = await _mediator.Send(new GetOfertaByIdQuery(id), ct);

        await _mediator.Send(new UpdateOfertaCommand(id, body), ct);

        var oldJson = JsonSerializer.Serialize(oldData);
        var newJson = JsonSerializer.Serialize(body);

        await _auditService.LogManualAsync(
            usuario: User?.Identity?.Name ?? "Anonimous",
            tabla: "Ofertas",
            accion: "UpdateEditable",
            registroId: id,
            oldValues: oldJson,
            newValues: newJson,
            ip: HttpContext.Connection.RemoteIpAddress?.ToString(),
            desc: "Actualización editable de oferta"
        );

        return NoContent();
    }

    // EndPoint: Archivar ofertas
    [Authorize]
    [HasPermission("OFERTAS_PRESENCIAL_EN_LINEA_VIEW")]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HttpPost("archivar-por-modalidad")]
    public async Task<IActionResult> ArchivarPorModalidad([FromBody] ArchivarOfertasPorModalidadCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    // EndPoint: Duplicar Ofertas
    [Authorize]
    [HasPermission("OFERTAS_PRESENCIAL_EN_LINEA_VIEW")]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HttpPost("duplicar")]
    public async Task<IActionResult> Duplicar([FromBody] DuplicarOfertasCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    // EndPoint: Importar Ofertas
    [Authorize]
    [HasPermission("OFERTAS_PRESENCIAL_EN_LINEA_VIEW")]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HttpPost("importar-presencial")]
    [AuditDisabled]
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

    // EndPoint: Cancelar Oferta por Id
    [Authorize]
    [HasPermission("OFERTAS_PRESENCIAL_EN_LINEA_VIEW")]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HttpPost("{id:int}/cancelar")]
    public async Task<IActionResult> Cancelar(int id, CancellationToken ct)
    {
        var ok = await _mediator.Send(new CancelarOfertaCommand(id), ct);

        if (!ok)
            return BadRequest(new { ok = false, message = "No se pudo cancelar, la oferta ya se encuentra cancelada." });

        return Ok(new { ok = true });
    }

    // EndPoint: Exportar Oferta Presencial/En Linea
    [Authorize]
    [HasPermission("OFERTAS_PRESENCIAL_EN_LINEA_VIEW")]
    [HttpGet("export/presencial-en_linea")]
    public async Task<IActionResult> ExportPresencialVirtual(
    [FromQuery] int periodoId,
    CancellationToken ct = default)
    {
        if (periodoId <= 0)
            return BadRequest("Debe seleccionar un período válido para exportar.");

        var bytes = await _mediator.Send(new ExportOfertasPresencialVirtualExcelQuery
        {
            PeriodoId = periodoId
        }, ct);

        var fileName = $"Oferta_Academica_{periodoId}_{DateTime.UtcNow:yyyyMMdd_HHmm}.xlsx";
        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

    // EndPoint: Exportar Oferta 100% Virtual
    [Authorize]
    [HasPermission("OFERTAS_VIRTUALES_VIEW")]
    [HttpGet("export/100%-virtual")]
    public async Task<IActionResult> ExportEnLinea([FromQuery] int periodoId, CancellationToken ct = default)
    {
        if (periodoId <= 0)
            return BadRequest("Debe seleccionar un período válido para exportar.");

        var bytes = await _mediator.Send(new ExportOfertasEnLineaExcelQuery
        {
            PeriodoId = periodoId
        }, ct);

        var fileName = $"Oferta_EnLinea_{periodoId}_{DateTime.UtcNow:yyyyMMdd_HHmm}.xlsx";
        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

}
