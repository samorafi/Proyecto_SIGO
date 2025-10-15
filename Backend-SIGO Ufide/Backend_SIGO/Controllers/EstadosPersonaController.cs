using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.EstadosPersona.Queries.GetAll;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/estadospersona")]
    //[Authorize]
    public class EstadosPersonaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EstadosPersonaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllEstadosPersonaQuery());
            return Ok(items);
        }
    }
}