using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.OfertaAsistenteSolicitudes.Commands.Responder;

public class ResponderOfertaAsistenteSolicitudCommandHandler
    : IRequestHandler<ResponderOfertaAsistenteSolicitudCommand, string>
{
    private readonly IApplicationDbContext _db;

    public ResponderOfertaAsistenteSolicitudCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<string> Handle(ResponderOfertaAsistenteSolicitudCommand request, CancellationToken ct)
    {
        var token = (request.Token ?? "").Trim();
        var accion = (request.Accion ?? "").Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(token))
            return "El enlace no es válido (falta el token).";

        if (accion is not ("aceptar" or "rechazar"))
            return "La acción indicada no es válida.";

        var solicitud = await _db.OfertaAsistenteSolicitudes
            .Include(x => x.Oferta)
            .Include(x => x.Persona)
            .FirstOrDefaultAsync(x => x.Token == token, ct);

        if (solicitud is null)
            return "La solicitud del asistente no fue encontrada o el enlace es incorrecto.\nRevisa si tienes una solicitud más reciente.";

        if (solicitud.EstadoSolicitud != 0)
        {
            return solicitud.EstadoSolicitud switch
            {
                1 => "Esta oferta como asistente ya había sido aceptada anteriormente.",
                2 => "Esta oferta como asistente ya había sido rechazada anteriormente.",
                _ => "Esta solicitud ya fue respondida previamente."
            };
        }

        solicitud.EstadoSolicitud = accion == "aceptar" ? (short)1 : (short)2;
        solicitud.FechaRespuesta = DateTime.UtcNow;

        var nombre = $"{solicitud.Persona?.Nombre} {solicitud.Persona?.PrimerApellido}".Trim();
        var notiMsg = accion == "aceptar"
            ? $"La persona {nombre} ACEPTÓ la oferta como asistente."
            : $"La persona {nombre} RECHAZÓ la oferta como asistente.";

        _db.Notificaciones.Add(new Notificacion
        {
            PersonaId = solicitud.PersonaId,
            OfertaId = solicitud.OfertaId,
            Leido = false,
            Mensaje = notiMsg,
            FechaCreacion = DateTime.UtcNow,
            FechaEvento = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);

        return accion == "aceptar"
            ? $"Gracias {nombre}, su aceptación como asistente ha sido registrada correctamente."
            : $"Gracias {nombre}, hemos registrado que ha rechazado la oferta como asistente.";
    }
}