using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Permisos.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermisosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PermisosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ======================================================
        // GET: api/Permisos
        // Devuelve todos los permisos disponibles en la BD.
        // ======================================================
        [HttpGet]
        public async Task<IActionResult> GetAllPermisos()
        {
            var result = await _mediator.Send(new GetAllPermisosQuery());
            return Ok(result);
        }
    }
}
