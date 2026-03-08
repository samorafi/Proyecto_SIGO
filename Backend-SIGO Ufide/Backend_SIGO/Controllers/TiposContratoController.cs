using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.TiposContrato.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/tiposcontrato")]
    public class TiposContratoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TiposContratoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllTiposContratoQuery());
            return Ok(items);
        }
    }
}