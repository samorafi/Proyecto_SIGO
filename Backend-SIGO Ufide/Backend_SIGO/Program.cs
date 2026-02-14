using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using SIGO.Api.Filters;
using SIGO.Application;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Security;
using SIGO.Application.Services;
using SIGO.Infrastructure;
using SIGO.Infrastructure.Persistence;
using SIGO.Infrastructure.Security;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)

    /* Función de autenticación de seguridad en sesiones antigua.
     * 
     * .AddCookie(options =>
    {
        // Configuraciones de seguridad de cookies y sesiones

        // Tiempo de inactividad
        options.ExpireTimeSpan = TimeSpan.FromMinutes(15);

        // Reinicia el contador si el usuario está activo.
        options.SlidingExpiration = true;

        // El cookie solo es accesible por el servidor
        options.Cookie.HttpOnly = true;

        // Usar solo con HTTPS
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

        // Protección CSRF 
        options.Cookie.SameSite = SameSiteMode.Strict; 

        // Endpoint para la redirección 
        options.LoginPath = "/api/Autenticacion/unauthorized";
    });*/

    .AddCookie(options =>
    {
        // Configuraciones de seguridad de cookies y sesiones

        // Path Controlador de autenticación.
        options.LoginPath = "/api/Autenticacion/unauthorized";
        options.AccessDeniedPath = "/api/Autenticacion/forbidden";

        // Tiempo de Inactividad.
        options.ExpireTimeSpan = TimeSpan.FromMinutes(15);
        options.SlidingExpiration = false;

        // Protección Cookies 
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = context =>
            {
                // Caso API → 401, NO REDIRECT
                if (context.Request.Path.StartsWithSegments("/api"))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                }

                // Caso MVC -> Redirección normal -> NO UTILIZAMOS MVC pero queda en dado caso.
                context.Response.Redirect(context.RedirectUri);
                return Task.CompletedTask;
            },

            OnRedirectToAccessDenied = context =>
            {
                // Caso API → 401, NO REDIRECT
                if (context.Request.Path.StartsWithSegments("/api"))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                }

                context.Response.Redirect(context.RedirectUri);
                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddScoped<IHashService, SIGO.Application.Services.BCryptHashService>();

// Registrar MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(SIGO.Application.DependencyInjection).Assembly));

// DbContext con PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

// Registrar la interfaz de ApplicationDbContext
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --------------------------------------------------------------------
// AUDITORIA: REGISTRO DE CAMBIOS DEL SISTEMA

builder.Services.AddScoped<IAuditService, AuditService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<AuditActionFilter>();
builder.Services.AddControllers(options =>
{
    options.Filters.AddService<AuditActionFilter>();
});
// --------------------------------------------------------------------

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "redis_host:6379"; 
    options.InstanceName = "SIGO_Session_";
});


// --------------------------------------------------------------------
//EXPORTAR EXCEL Y PDF
builder.Services.AddApplication();

builder.Services.AddInfrastructure();

// --------------------------------------------------------------------

var app = builder.Build();

// Swagger solo en Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
