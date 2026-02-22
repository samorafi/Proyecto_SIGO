using Microsoft.EntityFrameworkCore;
using SIGO.Infrastructure.Persistence; 

var builder = WebApplication.CreateBuilder(args);

// 🔹 Registrar DbContext con PostgreSQL
builder.Services.AddDbContext<SigoDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddOpenApi();

var app = builder.Build();

<<<<<<< Updated upstream
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
=======
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
>>>>>>> Stashed changes
{
    app.MapOpenApi();  
}

<<<<<<< Updated upstream
=======
app.MapGet("/health", () => Results.Ok("OK"));

app.UseCors("AllowAll");
>>>>>>> Stashed changes
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
