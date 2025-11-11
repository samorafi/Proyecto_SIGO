using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SIGO.Application.Services
{
    public interface IAuditService
    {
        Task LogManualAsync(
            string usuario,
            string tabla,
            string accion,
            int? registroId,
            object? oldValues,
            object? newValues,
            string? ip = null,
            string? desc = null);
    }

    public class AuditService : IAuditService
    {
        private readonly IApplicationDbContext _context;

        public AuditService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogManualAsync(
            string usuario,
            string tabla,
            string accion,
            int? registroId,
            object? oldValues,
            object? newValues,
            string? ip = null,
            string? desc = null)
        {
            try
            {
                // Opciones de serialización seguras (evita loops y referencias circulares)
                var jsonOptions = new JsonSerializerOptions
                {
                    ReferenceHandler = ReferenceHandler.IgnoreCycles,
                    WriteIndented = false
                };

                var entry = new BitacoraAuditoria
                {
                    Usuario = usuario?.Length > 150 ? usuario[..150] : usuario,
                    TablaAfectada = tabla?.Length > 100 ? tabla[..100] : tabla,
                    Accion = accion,
                    RegistroId = registroId,
                    ValoresAnteriores = oldValues is null ? null : JsonSerializer.Serialize(oldValues, jsonOptions),
                    ValoresNuevos = newValues is null ? null : JsonSerializer.Serialize(newValues, jsonOptions),
                    IpOrigen = ip,
                    Descripcion = desc,
                    Fecha = DateTime.UtcNow
                };

                _context.BitacoraAuditorias.Add(entry);
                await _context.SaveChangesAsync(CancellationToken.None);
            }
            catch (Exception ex)
            {
                // Manejo no intrusivo: Eb dado caso que la auditoría falla, no rompe el endpoint principal. - Importante
                Console.WriteLine($"[AuditService] Error al registrar bitácora: {ex.Message}");
            }
        }
    }
}
