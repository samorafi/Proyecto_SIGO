using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.TiposContrato.Queries.GetAll;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/tiposcontrato")]
    //[Authorize]
    public class TiposContratoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TiposContratoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllTiposContratoQuery());
            return Ok(items);
        }
    }
}