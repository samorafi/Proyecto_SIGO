using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Roles.Commands.AssignToUser;
using SIGO.Application.Features.Roles.Commands.Create;
using SIGO.Application.Features.Roles.Commands.Delete;
using SIGO.Application.Features.Roles.Commands.RemoveFromUser;
using SIGO.Application.Features.Roles.Commands.Update;
using SIGO.Application.Features.Roles.Queries.GetAllRoles;
using SIGO.Application.Features.Roles.Queries.GetRolById;
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

        // ======================================================
        // GET: api/Roles
        // Devuelve todos los roles existentes en la BD junto con sus permisos.
        // ======================================================
        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            var result = await _mediator.Send(new GetAllRolesQuery());
            return Ok(result);
        }

        // ======================================================
        // GET: api/Roles/{id}
        // Devuelve la información de un rol específico y sus permisos.
        // ======================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoleById(int id)
        {
            var result = await _mediator.Send(new GetRolByIdQuery(id));
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ======================================================
        // POST: api/Roles
        // Crea un nuevo rol en la BD y asigna los permisos seleccionados.
        // ======================================================
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRolCommand command)
        {
            var roleId = await _mediator.Send(command);
            return Ok(new { RoleId = roleId, Message = "Rol creado con permisos asignados." });
        }

        // ======================================================
        // PUT: api/Roles/{id}
        // Actualiza el nombre de un rol existente y re-asigna sus permisos.
        // ======================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRolCommand command)
        {
            if (id != command.RolId) return BadRequest();

            var success = await _mediator.Send(command);
            if (!success) return NotFound();

            return Ok(new { Message = "Rol actualizado correctamente." });
        }

        // ======================================================
        // DELETE: api/Roles/{id}
        // Elimina un rol existente de la BD junto con sus permisos asignados.
        // ======================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var success = await _mediator.Send(new DeleteRolCommand(id));
            if (!success) return NotFound();

            return Ok(new { Message = "Rol eliminado correctamente." });
        }

        // ======================================================
        // GET: api/Roles/usuario/{id}/permisos
        // Devuelve los roles y permisos asociados a un usuario específico.
        // ======================================================
        [HttpGet("usuario/{id}/permisos")]
        public async Task<IActionResult> GetRolesPermisos(int id)
        {
            var result = await _mediator.Send(new GetRolesPermisosQuery(id));
            return Ok(result);
        }

        // ======================================================
        // POST: api/Roles/asignar
        // Asigna un rol existente a un usuario existente.
        // ======================================================
        [HttpPost("asignar")]
        public async Task<IActionResult> AssignRoleToUser([FromBody] AssignRoleToUserCommand command)
        {
            var success = await _mediator.Send(command);
            if (!success) return NotFound(new { Message = "Usuario o Rol no encontrado." });

            return Ok(new { Message = "Rol asignado correctamente al usuario." });
        }

        // ======================================================
        // DELETE: api/Roles/remover
        // Remueve un rol específico de un usuario.
        // ======================================================
        [HttpDelete("remover")]
        public async Task<IActionResult> RemoveRoleFromUser([FromBody] RemoveRoleFromUserCommand command)
        {
            var success = await _mediator.Send(command);
            if (!success) return NotFound(new { Message = "La relación Usuario-Rol no existe." });

            return Ok(new { Message = "Rol removido correctamente del usuario." });
        }
    }
}
