using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Roles.Queries.GetRolesPermisos;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RolesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/Roles/usuario/1/permisos
        [HttpGet("usuario/{id}/permisos")]
        public async Task<IActionResult> GetRolesPermisos(int id)
        {
            var result = await _mediator.Send(new GetRolesPermisosQuery(id));
            return Ok(result);
        }
    }
}
