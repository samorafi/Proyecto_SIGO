using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.EstadosPersona.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/estadospersona")]
    public class EstadosPersonaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EstadosPersonaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllEstadosPersonaQuery());
            return Ok(items);
        }
    }
}