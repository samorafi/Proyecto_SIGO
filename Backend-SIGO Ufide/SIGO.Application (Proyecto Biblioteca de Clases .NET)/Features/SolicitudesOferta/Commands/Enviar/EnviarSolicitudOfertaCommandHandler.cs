using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.ConfigSmtp.Queries.Get;
using SIGO.Application.Features.SolicitudesOferta.Commands.Enviar;
using SIGO.Domain.Entities;
using System.Net;
using System.Net.Mail;

namespace SIGO.Application.Features.SolicitudesOferta.Commands.Enviar;

public class EnviarSolicitudOfertaCommandHandler
    : IRequestHandler<EnviarSolicitudOfertaCommand, int>
{
    private readonly IApplicationDbContext _db;
    private readonly IMediator _mediator;
    private readonly IConfiguration _config;

    // IDs de la tabla estado_ofertas
    private const int ESTADO_OFERTA_ENVIADA = 1;
    private const int ESTADO_OFERTA_PENDIENTE = 2;
    private const int ESTADO_OFERTA_ACEPTADA = 3;
    private const int ESTADO_OFERTA_RECHAZADA = 4;
    private const int ESTADO_OFERTA_CANCELADA = 5;

    public EnviarSolicitudOfertaCommandHandler(
        IApplicationDbContext db,
        IMediator mediator,
        IConfiguration config)
    {
        _db = db;
        _mediator = mediator;
        _config = config;
    }

    public async Task<int> Handle(EnviarSolicitudOfertaCommand request, CancellationToken ct)
    {
        var r = request.Data;

        // =========================
        // 1) Cargar Oferta + Persona (docente)
        // =========================
        var oferta = await _db.Ofertas
            .Include(o => o.Curso)
            .Include(o => o.Sede)
            .Include(o => o.Modalidad)
            .Include(o => o.Horario)
            .Include(o => o.Periodo)
            .FirstOrDefaultAsync(o => o.OfertaId == r.OfertaId, ct);

        if (oferta is null)
            throw new InvalidOperationException($"No se encontró la oferta {r.OfertaId}.");

        var docente = await _db.Personas
            .FirstOrDefaultAsync(p => p.Id == r.PersonaId, ct);

        if (docente is null)
            throw new InvalidOperationException($"No se encontró la persona (docente) {r.PersonaId}.");

        if (string.IsNullOrWhiteSpace(docente.Correo))
            throw new InvalidOperationException("El docente no tiene correo registrado.");

        var emailDestino = docente.Correo; 

        oferta.PersonaId = docente.Id; // Sobrescribir el docente asignado en la oferta

        // Evitar solicitudes PENDIENTES duplicadas para la misma oferta/persona
        var existePendiente = await _db.SolicitudesOferta
            .AnyAsync(s =>
                s.OfertaId == r.OfertaId &&
                s.PersonaId == r.PersonaId &&
                s.EstadoSolicitud == 0, // 0 = Pendiente
                ct);

        if (existePendiente)
            throw new InvalidOperationException("Ya existe una solicitud pendiente para esta oferta y este docente.");

        // =========================
        // 2) Generar token y URLs
        // =========================
        var token = Guid.NewGuid().ToString();

        // Base URL configurable (en appsettings.json)
        var baseUrl = _config["EmailLinks:PublicBaseUrl"]?.TrimEnd('/')
                      ?? "https://localhost:7287";

        // El endpoint que creamos está en: GET /api/SolicitudesOferta/responder
        var aceptarUrl = $"{baseUrl}/api/SolicitudesOferta/responder?token={token}&accion=aceptar";
        var rechazarUrl = $"{baseUrl}/api/SolicitudesOferta/responder?token={token}&accion=rechazar";

        // =========================
        // 3) Armar asunto y cuerpo del correo
        // =========================
        var cursoNombre = oferta.Curso?.Nombre ?? oferta.Curso?.Codigo ?? "Curso";
        var sedeNombre = oferta.Sede?.Nombre ?? "Sede";
        var modalidadNom = oferta.Modalidad?.Nombre ?? "Modalidad";
        var periodoTexto = oferta.Periodo?.Etiqueta ?? "Periodo";
        var horarioTexto = oferta.Horario is null
            ? "Horario"
            : $"{oferta.Horario.Dia} - {oferta.Horario.Rango}";

        var grupoTexto = oferta.Grupo.ToString();
        var cupoTexto = oferta.Cupo?.ToString() ?? "N/A";

        var asunto = $"Oferta de curso – {cursoNombre} – {periodoTexto}";

        var cuerpo = $@"
            Estimado(a) {docente.Nombre} {docente.PrimerApellido},

            La Universidad Fidélitas le ofrece la siguiente oferta académica:

            - Curso: {cursoNombre}
            - Sede: {sedeNombre}
            - Modalidad: {modalidadNom}
            - Período: {periodoTexto}
            - Horario: {horarioTexto}
            - Grupo: {grupoTexto}
            - Cupo: {cupoTexto} estudiantes

            Por favor, indique si acepta o rechaza esta oferta:

            ✔ Aceptar oferta:
            {aceptarUrl}

            ✖ Rechazar oferta:
            {rechazarUrl}

            Saludos cordiales,
            Coordinación Académica
            ";

        // =========================
        // 4) Crear registro en solicitud_oferta
        // =========================
        var solicitud = new SolicitudOferta
        {
            OfertaId = oferta.OfertaId,
            PersonaId = docente.Id,
            DestinatarioEmail = emailDestino,
            Asunto = asunto,
            Cuerpo = cuerpo,
            EstadoSolicitud = 0,           // Pendiente
            FechaEnvio = DateTime.UtcNow,
            Token = token,
            EstadoEnvio = 0,               // Pendiente de envío
            ErrorEnvio = null
        };

        _db.SolicitudesOferta.Add(solicitud);
        await _db.SaveChangesAsync(ct); // Guardamos antes de enviar correo

        // =========================
        // 5) Obtener ConfSMTP y enviar correo
        // =========================
        var conf = await _mediator.Send(new GetConfSmtpQuery(), ct);

        if (string.IsNullOrWhiteSpace(conf.Username) || string.IsNullOrWhiteSpace(conf.Password))
        {
            throw new InvalidOperationException(
                "La configuración SMTP no tiene usuario o contraseña configurados.");
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(conf.SenderEmail, conf.SenderName),
                Subject = asunto,
                Body = cuerpo,
                IsBodyHtml = false
            };

            message.To.Add(new MailAddress(emailDestino));

            using var client = new SmtpClient(conf.Host, conf.Port)
            {
                EnableSsl = conf.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            client.Credentials = new NetworkCredential(conf.Username, conf.Password);

            await client.SendMailAsync(message, ct);

            solicitud.EstadoEnvio = 1; // Enviado OK
            solicitud.ErrorEnvio = null;

            oferta.EstadoOfertaId = ESTADO_OFERTA_ENVIADA;
        }
        catch (Exception ex)
        {
            solicitud.EstadoEnvio = 2; // Error al enviar
            solicitud.ErrorEnvio = ex.Message;
            // Nota: en caso de error NO cambiamos el estado de la oferta
        }

        await _db.SaveChangesAsync(ct);

        return solicitud.SolicitudOfertaId;
    }
}
