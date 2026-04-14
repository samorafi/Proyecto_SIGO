using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Cantones.Queries.GetAll;

namespace SIGO.Api.Controllers
{

    [Authorize]
    [ApiController]
    [Route("api/cantones")]
    public class CantonesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CantonesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cantones = await _mediator.Send(new GetAllCantonesQuery());
            return Ok(cantones);
        }
    }
}