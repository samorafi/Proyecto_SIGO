using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.CategoriaDocentes.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/categoriadocentes")]
    public class CategoriaDocentesController : ControllerBase
    {

        private readonly IMediator _mediator;

        public CategoriaDocentesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _mediator.Send(new GetAllCategoriasDocenteQuery());
            return Ok(items);
        }
    }
}
