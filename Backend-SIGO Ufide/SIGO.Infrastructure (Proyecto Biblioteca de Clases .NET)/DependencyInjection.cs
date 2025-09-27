using Microsoft.Extensions.DependencyInjection;
using SIGO.Application.Abstrations;
using SIGO.Infrastructure.Services;

namespace SIGO.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            services.AddScoped<IJwtProvider, JwtProvider>();
            return services;
        }
    }
}
