using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Provincias.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/provincias")]
    public class ProvinciasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProvinciasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var provincias = await _mediator.Send(new GetAllProvinciasQuery());
            return Ok(provincias);
        }
    }
}