using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.SolicitudesOferta.Commands.Responder;

public class ResponderSolicitudOfertaCommandHandler
    : IRequestHandler<ResponderSolicitudOfertaCommand, string>
{
    private readonly IApplicationDbContext _db;

    // IDs de la tabla estado_ofertas
    private const int ESTADO_OFERTA_ENVIADA = 1;
    private const int ESTADO_OFERTA_PENDIENTE = 2;
    private const int ESTADO_OFERTA_ACEPTADA = 3;
    private const int ESTADO_OFERTA_RECHAZADA = 4;
    private const int ESTADO_OFERTA_CANCELADA = 5;

    public ResponderSolicitudOfertaCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<string> Handle(ResponderSolicitudOfertaCommand request, CancellationToken ct)
    {
        var token = (request.Token ?? "").Trim();
        var accion = (request.Accion ?? "").Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(token))
            return "El enlace no es válido (falta el token).";

        if (accion is not ("aceptar" or "rechazar"))
            return "La acción indicada no es válida.";

        // 1) Buscar la solicitud por token (incluye oferta y persona)
        var solicitud = await _db.SolicitudesOferta
            .Include(s => s.Oferta)
            .Include(s => s.Persona)
            .FirstOrDefaultAsync(s => s.Token == token, ct);

        if (solicitud is null)
            return "La solicitud de oferta no fue encontrada o el enlace es incorrecto.";

        // 2) Verificar si ya fue respondida
        if (solicitud.EstadoSolicitud != 0) // 0 = Pendiente
        {
            return solicitud.EstadoSolicitud switch
            {
                1 => "Esta oferta ya había sido aceptada anteriormente.",
                2 => "Esta oferta ya había sido rechazada anteriormente.",
                _ => "Esta solicitud ya fue respondida previamente."
            };
        }

        // 3) Marcar solicitud y cambiar el estado de la oferta
        if (accion == "aceptar")
        {
            solicitud.EstadoSolicitud = 1; // Aceptada
            if (solicitud.Oferta is not null)
            {
                solicitud.Oferta.EstadoOfertaId = ESTADO_OFERTA_ACEPTADA;
            }
        }
        else if (accion == "rechazar")
        {
            solicitud.EstadoSolicitud = 2; // Rechazada
            if (solicitud.Oferta is not null)
            {
                solicitud.Oferta.EstadoOfertaId = ESTADO_OFERTA_RECHAZADA;
            }
        }

        solicitud.FechaRespuesta = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        // 4) Mensaje de respuesta para el navegador del docente
        var nombreDocente = $"{solicitud.Persona.Nombre} {solicitud.Persona.PrimerApellido}".Trim();

        return accion == "aceptar"
            ? $"Gracias {nombreDocente}, su aceptación de la oferta ha sido registrada correctamente."
            : $"Gracias {nombreDocente}, hemos registrado que ha rechazado la oferta.";
    }
}
