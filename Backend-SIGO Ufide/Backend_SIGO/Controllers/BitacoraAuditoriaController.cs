using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Auditoria.Dto;
using SIGO.Application.Features.Auditoria.Queries;
using SIGO.Application.Models.Common;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/auditoria")]
    public class BitacoraAuditoriaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BitacoraAuditoriaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResponse<BitacoraAuditoriaDto>>> GetAll(
            [FromQuery] AuditQueryParams query,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetAuditoriaQuery(query), ct);
            return Ok(result);
        }

        [HttpGet("{tabla}/{registroId:int}")]
        public async Task<ActionResult<PagedResponse<BitacoraAuditoriaDto>>> GetByEntity(
            string tabla,
            int registroId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var queryParams = new AuditQueryParams
            {
                Tabla = tabla,
                RegistroId = registroId,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(new GetAuditoriaQuery(queryParams), ct);
            return Ok(result);
        }


        [HttpGet("{id:int}")]
        public async Task<ActionResult<BitacoraAuditoriaDto>> GetById(int id, CancellationToken ct)
        {

            var queryParams = new AuditQueryParams
            {
                Page = 1,
                PageSize = 1
            };

            var result = await _mediator.Send(new GetAuditoriaQuery(queryParams), ct);

            var item = result.Items.FirstOrDefault(x => x.Id == id);
            if (item is null)
                return NotFound(new { message = $"No se encontró registro de auditoría con id {id}." });

            return Ok(item);
        }
    }
}
