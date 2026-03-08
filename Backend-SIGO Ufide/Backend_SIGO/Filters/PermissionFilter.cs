using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using SIGO.Api.Attributes;
using SIGO.Application.Abstractions;
using System.Security.Claims;

namespace SIGO.Api.Filters
{
    public class PermissionFilter : IAsyncActionFilter
    {
        private readonly IApplicationDbContext _context;

        public PermissionFilter(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var permissions = context.ActionDescriptor.EndpointMetadata
                .OfType<HasPermissionAttribute>()
                .Select(x => x.Permission)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToList();

            if (!permissions.Any())
            {
                await next();
                return;
            }

            var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var normalizedPermissions = permissions
                .Select(p => p.Trim().ToUpper())
                .ToList();

            var hasPermission = await _context.UsuarioRoles
                .Where(ur => ur.UsuarioId == userId)
                .SelectMany(ur => ur.Rol.RolPermisos)
                .AnyAsync(rp => normalizedPermissions.Contains(rp.Permiso.Clave.ToUpper()));

            if (!hasPermission)
            {
                context.Result = new ForbidResult();
                return;
            }

            await next();
        }
    }
}