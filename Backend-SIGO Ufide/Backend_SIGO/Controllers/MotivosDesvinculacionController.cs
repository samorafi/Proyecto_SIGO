using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.MotivosDesvinculacion.Queries.GetAll;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/motivosdesvinculacion")]
    //[Authorize]
    public class MotivosDesvinculacionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MotivosDesvinculacionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllMotivosDesvinculacionQuery());
            return Ok(items);
        }
    }
}