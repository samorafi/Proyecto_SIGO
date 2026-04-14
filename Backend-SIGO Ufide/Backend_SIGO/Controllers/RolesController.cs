using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Api.Attributes;
using SIGO.Application.Features.Roles.Commands.AssignToUser;
using SIGO.Application.Features.Roles.Commands.Create;
using SIGO.Application.Features.Roles.Commands.Delete;
using SIGO.Application.Features.Roles.Commands.RemoveFromUser;
using SIGO.Application.Features.Roles.Commands.Update;
using SIGO.Application.Features.Roles.Queries.GetAllRoles;
using SIGO.Application.Features.Roles.Queries.GetRolById;
using SIGO.Application.Features.Roles.Queries.GetRolesPermisos;
using SIGO.Application.Features.Roles.Queries.GetUsuariosAsignadosARol;


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

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            var result = await _mediator.Send(new GetAllRolesQuery());
            return Ok(result);
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoleById(int id)
        {
            var result = await _mediator.Send(new GetRolByIdQuery(id));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRolCommand command)
        {
            var roleId = await _mediator.Send(command);
            return Ok(new { RoleId = roleId, Message = "Rol creado con permisos asignados." });
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRolCommand command)
        {
            if (id != command.RolId) return BadRequest();

            var success = await _mediator.Send(command);
            if (!success) return NotFound();

            return Ok(new { Message = "Rol actualizado correctamente." });
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var success = await _mediator.Send(new DeleteRolCommand(id));
            if (!success) return NotFound();

            return Ok(new { Message = "Rol eliminado correctamente." });
        }

        [Authorize]
        [HttpGet("usuario/{id}/permisos")]
        public async Task<IActionResult> GetRolesPermisos(int id)
        {
            var result = await _mediator.Send(new GetRolesPermisosQuery(id));
            return Ok(result);
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpPost("asignar")]
        public async Task<IActionResult> AssignRoleToUser([FromBody] AssignRoleToUserCommand command)
        {
            var success = await _mediator.Send(command);
            if (!success) return NotFound(new { Message = "Usuario o Rol no encontrado." });

            return Ok(new { Message = "Rol asignado correctamente al usuario." });
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpDelete("remover")]
        public async Task<IActionResult> RemoveRoleFromUser([FromBody] RemoveRoleFromUserCommand command)
        {
            var success = await _mediator.Send(command);
            if (!success) return NotFound(new { Message = "La relación Usuario-Rol no existe." });

            return Ok(new { Message = "Rol removido correctamente del usuario." });
        }

        [Authorize]
        [HasPermission("ADMIN_VIEW")]
        [HttpGet("{id:int}/usuarios")]
        public async Task<IActionResult> GetUsuariosDelRol(int id)
        {
            var usuarios = await _mediator.Send(new GetUsuariosAsignadosARolQuery(id));
            return Ok(usuarios);
        }
    }
}
