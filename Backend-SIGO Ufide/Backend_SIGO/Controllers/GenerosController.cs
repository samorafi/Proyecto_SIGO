using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Generos.Queries.GetAll;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/generos")]
    public class GenerosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GenerosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var generos = await _mediator.Send(new GetAllGenerosQuery());
            return Ok(generos);
        }
    }
}
