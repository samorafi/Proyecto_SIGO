using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
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

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "redis_host:6379"; 
    options.InstanceName = "SIGO_Session_";
});

var app = builder.Build();

// Swagger solo en Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
