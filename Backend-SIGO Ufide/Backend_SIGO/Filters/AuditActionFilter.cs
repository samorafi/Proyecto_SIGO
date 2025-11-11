using Microsoft.AspNetCore.Mvc.Filters;
using SIGO.Api.Attributes;
using SIGO.Application.Services;

namespace SIGO.Api.Filters
{
    public class AuditActionFilter : IAsyncActionFilter
    {
        private readonly IAuditService _auditService;

        public AuditActionFilter(IAuditService auditService)
        {
            _auditService = auditService;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Si el controlador tiene el atributo [AuditDisabled], ignorar auditoría
            if (context.ActionDescriptor.EndpointMetadata.OfType<AuditDisabledAttribute>().Any() ||
                context.Controller.GetType().GetCustomAttributes(typeof(AuditDisabledAttribute), true).Any())
            {
                await next();
                return;
            }

            // Procede con la auditoria siempre y cuando el controlador utiliza el atributo [Audit]
            var hasAudit = context.ActionDescriptor.EndpointMetadata.OfType<AuditAttribute>().Any() ||
                           context.Controller.GetType().GetCustomAttributes(typeof(AuditAttribute), true).Any();

            // Ejecutar la acción del controlador
            var executed = await next();

            if (!hasAudit)
                return;

            var http = context.HttpContext;
            var method = http.Request.Method;
            var path = http.Request.Path;
            var ip = http.Connection.RemoteIpAddress?.ToString();
            var user = http.User?.Identity?.Name ?? "Anon";

            // Registrar solo metadatos (sin JSON)
            await _auditService.LogManualAsync(
                usuario: user,
                tabla: (context.ActionDescriptor.RouteValues["controller"] ?? "Desconocido")?.ToString(),
                accion: method,
                registroId: null,
                oldValues: null,
                newValues: null,
                ip: ip,
                desc: $"[{method}] {path}"
            );
        }
    }
}
