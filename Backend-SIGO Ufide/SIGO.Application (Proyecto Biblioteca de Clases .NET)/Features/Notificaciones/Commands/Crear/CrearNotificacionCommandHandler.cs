using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Notificaciones.Commands.Crear;

public class CrearNotificacionCommandHandler : IRequestHandler<CrearNotificacionCommand, int>
{
    private readonly IApplicationDbContext _db;

    public CrearNotificacionCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<int> Handle(CrearNotificacionCommand request, CancellationToken ct)
    {
        var r = request.Data;

        if (r is null)
            throw new InvalidOperationException("Los datos de la notificación son requeridos.");

        if (r.PersonaId <= 0 || r.OfertaId <= 0 || r.SolicitudOfertaId <= 0)
            throw new InvalidOperationException("personaId, ofertaId y solicitudOfertaId son obligatorios.");

        if (string.IsNullOrWhiteSpace(r.Mensaje))
            throw new InvalidOperationException("El mensaje es obligatorio.");

        var personaExiste = await _db.Personas.AnyAsync(x => x.Id == r.PersonaId, ct);
        if (!personaExiste) throw new InvalidOperationException($"No se encontró la persona {r.PersonaId}.");

        var ofertaExiste = await _db.Ofertas.AnyAsync(x => x.OfertaId == r.OfertaId, ct);
        if (!ofertaExiste) throw new InvalidOperationException($"No se encontró la oferta {r.OfertaId}.");

        var solicitudExiste = await _db.SolicitudesOferta.AnyAsync(x => x.SolicitudOfertaId == r.SolicitudOfertaId, ct);
        if (!solicitudExiste) throw new InvalidOperationException($"No se encontró la solicitud {r.SolicitudOfertaId}.");

        var entity = new Notificacion
        {
            PersonaId = r.PersonaId,
            OfertaId = r.OfertaId,
            SolicitudOfertaId = r.SolicitudOfertaId,
            Mensaje = r.Mensaje.Trim(),
            Leido = false,
            FechaCreacion = DateTime.UtcNow,
            FechaEvento = r.FechaEvento
        };

        _db.Notificaciones.Add(entity);
        await _db.SaveChangesAsync(ct);

        return entity.NotificacionId;
    }
}
