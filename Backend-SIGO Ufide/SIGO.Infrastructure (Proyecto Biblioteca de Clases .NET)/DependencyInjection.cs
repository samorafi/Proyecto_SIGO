using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIGO.Application.Abstractions;
using SIGO.Infrastructure.Services.Email;
using SIGO.Infrastructure.Services.Exports;
using SIGO.Infrastructure.Services.Security;

namespace SIGO.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<INominaExportService, NominaExportService>();
            services.AddSingleton<IOtpGenerator, OtpGenerator>();
            services.AddScoped<IEmailSender, SmtpEmailSender>();
            services.AddScoped<IPermanencia4ExportService, Permanencia4ExportService>();

            services.AddSingleton<IHmacService>(_ =>
            {
                var key = configuration["Security:ResetTokenHmacKey"];
                if (string.IsNullOrWhiteSpace(key))
                    throw new InvalidOperationException("Falta configurar Security:ResetTokenHmacKey.");
                return new HmacService(key);
            });

            return services;
        }
    }
}
