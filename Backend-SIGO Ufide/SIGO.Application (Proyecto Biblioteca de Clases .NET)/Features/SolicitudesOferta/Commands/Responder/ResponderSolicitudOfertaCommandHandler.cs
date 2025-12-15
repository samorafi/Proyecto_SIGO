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
                solicitud.Oferta.EstadoOfertaId = ESTADO_OFERTA_ACEPTADA;
        }
        else // rechazar
        {
            solicitud.EstadoSolicitud = 2; // Rechazada
            if (solicitud.Oferta is not null)
                solicitud.Oferta.EstadoOfertaId = ESTADO_OFERTA_RECHAZADA;
        }

        // 3.5) Crear Notificación (automática)
        var docenteNombre = $"{solicitud.Persona?.Nombre} {solicitud.Persona?.PrimerApellido}".Trim();
        var oferta = solicitud.Oferta;

        static string GetPropAsString(object? obj, params string[] names)
        {
            if (obj is null) return "";
            var t = obj.GetType();
            foreach (var n in names)
            {
                var p = t.GetProperty(n);
                if (p is null) continue;
                var v = p.GetValue(obj);
                if (v is null) continue;
                var s = v.ToString();
                if (!string.IsNullOrWhiteSpace(s)) return s.Trim();
            }
            return "";
        }

        var codigo = GetPropAsString(oferta, "CodigoCurso", "Codigo", "CursoCodigo", "CodigoMateria");
        var curso = GetPropAsString(oferta, "CursoNombre", "Curso", "NombreCurso", "NombreMateria");
        var grupo = GetPropAsString(oferta, "Grupo");
        var sede = GetPropAsString(oferta, "Sede");
        var modalidad = GetPropAsString(oferta, "Modalidad");
        var periodo = GetPropAsString(oferta, "PeriodoCodigo", "Periodo", "PeriodoNombre", "PeriodoId");

        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(codigo)) parts.Add(codigo);
        if (!string.IsNullOrWhiteSpace(curso)) parts.Add(curso);
        if (!string.IsNullOrWhiteSpace(grupo)) parts.Add($"Grupo {grupo}");
        if (!string.IsNullOrWhiteSpace(sede)) parts.Add(sede);
        if (!string.IsNullOrWhiteSpace(modalidad)) parts.Add(modalidad);
        if (!string.IsNullOrWhiteSpace(periodo)) parts.Add(periodo);

        var asunto = parts.Count > 0
            ? string.Join(" | ", parts)
            : $"OfertaId: {solicitud.OfertaId}";

        var notiMsg = accion == "aceptar"
            ? $"Asunto: {asunto}. El docente {docenteNombre} ACEPTÓ la oferta."
            : $"Asunto: {asunto}. El docente {docenteNombre} RECHAZÓ la oferta.";

        _db.Notificaciones.Add(new Notificacion
        {
            PersonaId = solicitud.PersonaId,
            OfertaId = solicitud.OfertaId,
            SolicitudOfertaId = solicitud.SolicitudOfertaId,
            Leido = false,
            Mensaje = notiMsg,
            FechaCreacion = DateTime.UtcNow,
            FechaEvento = DateTime.UtcNow
        });

        solicitud.FechaRespuesta = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        // 4) Mensaje de respuesta para el navegador del docente
        return accion == "aceptar"
            ? $"Gracias {docenteNombre}, su aceptación de la oferta ha sido registrada correctamente."
            : $"Gracias {docenteNombre}, hemos registrado que ha rechazado la oferta.";
    }

}
