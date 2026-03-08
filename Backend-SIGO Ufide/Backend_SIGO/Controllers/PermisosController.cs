using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Api.Attributes;
using SIGO.Application.Features.Permisos.Queries.GetAll;

namespace SIGO.Api.Controllers
{
    [Authorize]
    [HasPermission("ADMIN_VIEW")]
    [ApiController]
    [Route("api/[controller]")]
    public class PermisosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PermisosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpGet]
        public async Task<IActionResult> GetAllPermisos()
        {
            var result = await _mediator.Send(new GetAllPermisosQuery());
            return Ok(result);
        }
    }
}
