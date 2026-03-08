using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Atestados.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/atestados")]
    public class AtestadosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AtestadosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var atestados = await _mediator.Send(new GetAllAtestadosQuery());
            return Ok(atestados);
        }
    }
}
