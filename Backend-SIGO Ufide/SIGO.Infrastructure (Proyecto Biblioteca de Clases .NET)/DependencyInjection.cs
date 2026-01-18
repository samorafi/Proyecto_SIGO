using Microsoft.Extensions.DependencyInjection;
using SIGO.Application.Abstractions;
using SIGO.Infrastructure.Services.Exports;

namespace SIGO.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            services.AddScoped<INominaExportService, NominaExportService>();
            return services;
        }
    }
}
