using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.CategoriaDocentes.Queries.GetAll;
using System.Threading.Tasks;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/categoriadocentes")]
    //[Authorize]
    public class CategoriaDocentesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CategoriaDocentesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllCategoriasDocenteQuery());
            return Ok(items);
        }
    }
}
