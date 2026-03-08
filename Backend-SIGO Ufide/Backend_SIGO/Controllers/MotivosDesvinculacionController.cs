using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.MotivosDesvinculacion.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/motivosdesvinculacion")]
    public class MotivosDesvinculacionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MotivosDesvinculacionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllMotivosDesvinculacionQuery());
            return Ok(items);
        }
    }
}