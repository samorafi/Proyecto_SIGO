using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Provincias.Queries.GetAll;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/provincias")]
    //[Authorize]
    public class ProvinciasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProvinciasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var provincias = await _mediator.Send(new GetAllProvinciasQuery());
            return Ok(provincias);
        }
    }
}