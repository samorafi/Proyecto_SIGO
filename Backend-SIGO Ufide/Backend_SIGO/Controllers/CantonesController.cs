using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Cantones.Queries.GetAll;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/cantones")]
    //[Authorize]
    public class CantonesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CantonesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cantones = await _mediator.Send(new GetAllCantonesQuery());
            return Ok(cantones);
        }
    }
}