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
using DotNetEnv;

// 1. Cargar variables de entorno (.env) al inicio
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// 2. Configuración de Autenticación (Cookies)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/api/Autenticacion/unauthorized";
        options.AccessDeniedPath = "/api/Autenticacion/forbidden";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(15);
        options.SlidingExpiration = false;
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
		options.Cookie.HttpOnly = true;

        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = context =>
            {
                if (context.Request.Path.StartsWithSegments("/api"))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                }
                context.Response.Redirect(context.RedirectUri);
                return Task.CompletedTask;
            },
            OnRedirectToAccessDenied = context =>
            {
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

// 3. CORS (Permitir todo)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true)   
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 4. Servicios de Aplicación
builder.Services.AddScoped<IHashService, SIGO.Application.Services.BCryptHashService>();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(SIGO.Application.DependencyInjection).Assembly));

// 5. Base de Datos (Neon Postgres)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

// 6. Auditoría y Usuario Actual
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<AuditActionFilter>();

// 7. Controladores (Configuración Unificada con Filtros Globales)
builder.Services.AddControllers(options =>
{
    options.Filters.AddService<AuditActionFilter>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 8. CACHÉ (CORRECCIÓN CLAVE: Usar Memoria en lugar de Redis)
// Esto permite que las sesiones funcionen sin necesitar un servidor Redis externo.
builder.Services.AddDistributedMemoryCache();

// 9. Capas de Aplicación e Infraestructura
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

var app = builder.Build();

// 10. Pipeline HTTP
// Habilitar Swagger siempre (o condicionalmente si prefieres)
// Nota: Si usas Docker con 'ENV ASPNETCORE_ENVIRONMENT=Development', entrará aquí.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

var enableSwagger = app.Environment.IsDevelopment() ||
                    builder.Configuration.GetValue<bool>("EnableSwagger");

if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok("OK"));

app.UseCors();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();