using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.ConfigSmtp.Queries.Get;
using SIGO.Domain.Entities;
using System.Net;
using System.Net.Mail;

namespace SIGO.Application.Features.OfertaAsistenteSolicitudes.Commands.Enviar;

public class EnviarOfertaAsistenteSolicitudCommandHandler
    : IRequestHandler<EnviarOfertaAsistenteSolicitudCommand, int>
{
    private readonly IApplicationDbContext _db;
    private readonly IMediator _mediator;
    private readonly IConfiguration _config;

    public EnviarOfertaAsistenteSolicitudCommandHandler(
        IApplicationDbContext db,
        IMediator mediator,
        IConfiguration config)
    {
        _db = db;
        _mediator = mediator;
        _config = config;
    }

    public async Task<int> Handle(EnviarOfertaAsistenteSolicitudCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var oferta = await _db.Ofertas
            .Include(o => o.Curso)
            .Include(o => o.Sede)
            .Include(o => o.Modalidad)
            .Include(o => o.Horario)
            .Include(o => o.Periodo)
            .Include(o => o.Persona)
            .FirstOrDefaultAsync(o => o.OfertaId == r.OfertaId, ct);

        if (oferta is null)
            throw new InvalidOperationException($"No se encontró la oferta {r.OfertaId}.");

        var asistente = await _db.Personas
            .FirstOrDefaultAsync(p => p.Id == r.PersonaId, ct);

        if (asistente is null)
            throw new InvalidOperationException($"No se encontró la persona {r.PersonaId}.");

        if (string.IsNullOrWhiteSpace(asistente.Correo))
            throw new InvalidOperationException("El asistente no tiene correo registrado.");

        var estaAsignado = await _db.OfertaAsistentes
            .AnyAsync(x => x.OfertaId == r.OfertaId && x.PersonaId == r.PersonaId, ct);

        if (!estaAsignado)
            throw new InvalidOperationException("La persona indicada no está asignada como asistente en esta oferta.");

        // Permitir reenvíos ilimitados al asistente.
        // Si ya existe una solicitud pendiente para esta oferta/asistente,
        // se reutiliza actualizando token, cuerpo y fecha de envío.
        var solicitudPendienteExistente = await _db.OfertaAsistenteSolicitudes
            .Where(x =>
                x.OfertaId == r.OfertaId &&
                x.PersonaId == r.PersonaId &&
                x.EstadoSolicitud == 0)
            .OrderByDescending(x => x.FechaEnvio)
            .FirstOrDefaultAsync(ct);

        var token = Guid.NewGuid().ToString();

        var baseUrl = _config["EmailLinks:PublicBaseUrl"]?.TrimEnd('/')
                      ?? "https://localhost:7287";

        var aceptarUrl = $"{baseUrl}/api/OfertaAsistenteSolicitudes/responder?token={token}&accion=aceptar";
        var rechazarUrl = $"{baseUrl}/api/OfertaAsistenteSolicitudes/responder?token={token}&accion=rechazar";

        var asistenteNombre = $"{asistente.Nombre} {asistente.PrimerApellido}".Trim();

        var docentePrincipalNombre = oferta.Persona is null
            ? "DOCENTE POR DEFINIR"
            : $"{oferta.Persona.Nombre} {oferta.Persona.PrimerApellido}".Trim();

        var profesorTxt = string.IsNullOrWhiteSpace(docentePrincipalNombre)
            ? "DOCENTE POR DEFINIR"
            : docentePrincipalNombre.ToUpperInvariant();

        var sedeTxt = oferta.Sede?.Nombre ?? "—";
        var modalidadTxt = oferta.Modalidad?.Nombre ?? "—";

        var esEnLinea =
            string.Equals(modalidadTxt?.Trim(), "En Línea", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(modalidadTxt?.Trim(), "En Linea", StringComparison.OrdinalIgnoreCase);

        var horarioHeaderTxt = esEnLinea
            ? "Horario Sesión Sincrónica"
            : "Horario";

        var mensajeConfirmacionFinal = esEnLinea
            ? "Favor confirmar horario sincrónico."
            : "Quedo atenta a su confirmación.";

        var periodoTxt = oferta.Periodo?.Etiqueta ?? "—";
        var horarioTxt = oferta.Horario is null ? "—" : $"{oferta.Horario.Dia} - {oferta.Horario.Rango}";
        var diaTxt = oferta.Horario?.Dia ?? "—";
        var grupoTxt = oferta.Grupo.ToString();
        var cupoTxt = oferta.Cupo?.ToString() ?? "N/A";
        var matriculaTxt = cupoTxt;
        var codigoTxt = oferta.Curso?.Codigo ?? oferta.Curso?.Nombre ?? "—";
        var materiaTxt = oferta.Curso?.Nombre ?? "—";

        var gradoTxt = "Bachillerato";
        var carreraTxt = "Sistemas";
        var accionTxt = "Asignar Profesor Asistente";

        // AQUÍ SE REFLEJA EL PERÍODO DE EVALUACIÓN DOCENTE SELECCIONADO
        string evalPeriodoTxt = "—";
        if (r.EvaluacionPeriodoId.HasValue)
        {
            var pEval = await _db.Periodos
                .FirstOrDefaultAsync(p => p.PeriodoId == r.EvaluacionPeriodoId.Value, ct);

            if (pEval is not null)
            {
                var tipoTxt = pEval.Tipo switch
                {
                    PeriodoTipo.Cuatrimestre => "C",
                    PeriodoTipo.Trimestre => "T",
                    PeriodoTipo.Mensual => "P",
                    _ => ""
                };

                evalPeriodoTxt = !string.IsNullOrWhiteSpace(tipoTxt)
                    ? $"{pEval.Numero}{tipoTxt} - {pEval.Anio}"
                    : (!string.IsNullOrWhiteSpace(pEval.EtiquetaRuntime)
                        ? pEval.EtiquetaRuntime
                        : pEval.Etiqueta);
            }
        }

        var asunto = $"IMPORTANTE: NOMBRAMIENTO ASISTENTE - {periodoTxt} -";

        var cuerpoHtml = $@"
<div style=""background:#111827;color:white;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;padding:16px;border-radius:12px;"">
  <div style=""font-size:13px;font-weight:600;margin-bottom:12px;color:#E5E7EB;"">
    {Html(asunto)}
  </div>

  <div style=""font-size:14px;line-height:1.6;color:#F9FAFB;"">
    <div>Estimado/a</div>
    <div>Es un gusto saludarle.</div>
    <div style=""margin-top:8px;"">
      Quisiera confirmar su disponibilidad para participar como <b>profesor asistente</b> en el <b>{Html(periodoTxt)}</b> y, en caso afirmativo,
      conocer su aceptación para este posible nombramiento.
    </div>
  </div>

  <div style=""margin-top:16px;overflow-x:auto;"">
    <table style=""width:100%;min-width:760px;border-collapse:separate;border-spacing:0;font-size:12px;"">
      <thead>
        <tr>
          {Th("Grado")}{Th("Carrera")}{Th("Sede")}{Th("Periodo")}
          {Th("Código")}{Th("Materia")}{Th("Grupo")}{Th("Día")}
          {Th(horarioHeaderTxt)}{Th("Matrícula")}{Th("Acción")}{Th("Profesor")}
          <th style=""border-top:1px solid #374151;border-bottom:1px solid #374151;border-right:1px solid #374151;background:#1F2937;""></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {Td(gradoTxt)}{Td(carreraTxt)}{Td(sedeTxt)}{Td(periodoTxt)}
          {Td(codigoTxt)}{Td(materiaTxt)}{Td(grupoTxt)}{Td(diaTxt)}
          {Td(horarioTxt)}{Td(matriculaTxt)}{Td(accionTxt)}{Td(profesorTxt)}
          <td style=""border-bottom:1px solid #374151;border-right:1px solid #374151;""></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style=""margin-top:16px;font-size:14px;line-height:1.6;color:#F9FAFB;"">
    <div>Asimismo le recuerdo que este nombramiento está sujeto a:</div>

    <ul style=""margin-top:10px;padding-left:0;list-style:none;"">
      {Li($"Sus resultados en la Evaluación Docente del {evalPeriodoTxt}.")}
      {Li("La matrícula de los cursos asignados.")}
      {Li("La apertura de los cursos en Reserva, los cuales se habilitan bajo demanda a lo largo del periodo de matrícula. No hay una fecha exacta para su apertura y esta puede darse incluso en la semana 17.")}
      {Li("La asignación de los cursos es enviada a Procesos Académicos, departamento encargado de gestionar la asignación a nivel de sistema, cuando esto suceda usted podrá visualizar los cursos en el SAM y Campus Virtual.")}
    </ul>

    <div style=""margin-top:14px;"">{Html(mensajeConfirmacionFinal)}</div>
    <div style=""margin-top:8px;"">Saludos cordiales,</div>
    <div style=""font-weight:600;color:#F9FAFB;"">Coordinación Académica</div>

    <div style=""margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;"">
      <a href=""{HtmlAttr(aceptarUrl)}"" style=""background:#16a34a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:700;font-size:13px;"">
        Aceptar oferta
      </a>
      <a href=""{HtmlAttr(rechazarUrl)}"" style=""background:#dc2626;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:700;font-size:13px;"">
        Rechazar oferta
      </a>
    </div>
  </div>
</div>";

        var ahora = DateTime.UtcNow;

        OfertaAsistenteSolicitud solicitud;

        if (solicitudPendienteExistente is not null)
        {
            solicitud = solicitudPendienteExistente;

            solicitud.DestinatarioEmail = asistente.Correo;
            solicitud.Asunto = asunto;
            solicitud.Cuerpo = cuerpoHtml;
            solicitud.FechaEnvio = ahora;
            solicitud.FechaRespuesta = null;
            solicitud.Token = token;
            solicitud.EstadoEnvio = 0;
            solicitud.ErrorEnvio = null;
        }
        else
        {
            solicitud = new OfertaAsistenteSolicitud
            {
                OfertaId = oferta.OfertaId,
                PersonaId = asistente.Id,
                DestinatarioEmail = asistente.Correo,
                Asunto = asunto,
                Cuerpo = cuerpoHtml,
                EstadoSolicitud = 0,
                FechaEnvio = ahora,
                FechaRespuesta = null,
                Token = token,
                EstadoEnvio = 0,
                ErrorEnvio = null
            };

            _db.OfertaAsistenteSolicitudes.Add(solicitud);
        }

        await _db.SaveChangesAsync(ct);

        var conf = await _mediator.Send(new GetConfSmtpQuery(), ct);

        if (string.IsNullOrWhiteSpace(conf.Username) || string.IsNullOrWhiteSpace(conf.Password))
            throw new InvalidOperationException("La configuración SMTP no tiene usuario o contraseña configurados.");

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(conf.SenderEmail, conf.SenderName),
                Subject = asunto,
                Body = cuerpoHtml,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(asistente.Correo));

            using var client = new SmtpClient(conf.Host, conf.Port)
            {
                EnableSsl = conf.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(conf.Username, conf.Password)
            };

            await client.SendMailAsync(message, ct);

            solicitud.EstadoEnvio = 1;
            solicitud.ErrorEnvio = null;
        }
        catch (Exception ex)
        {
            solicitud.EstadoEnvio = 2;
            solicitud.ErrorEnvio = ex.Message;
        }

        _db.Notificaciones.Add(new Notificacion
        {
            PersonaId = asistente.Id,
            OfertaId = oferta.OfertaId,
            Leido = false,
            Mensaje = solicitud.EstadoEnvio == 1
                ? $"Asunto: {asunto}. Se envió la oferta al asistente {asistenteNombre}."
                : $"Asunto: {asunto}. Error al enviar la oferta al asistente {asistenteNombre}. Error: {solicitud.ErrorEnvio}",
            FechaCreacion = DateTime.UtcNow,
            FechaEvento = solicitud.FechaEnvio
        });

        await _db.SaveChangesAsync(ct);

        return solicitud.OfertaAsistenteSolicitudId;
    }

    private static string Html(string? s) => WebUtility.HtmlEncode(s ?? "");
    private static string HtmlAttr(string? s) => WebUtility.HtmlEncode(s ?? "");

    private static string Th(string text) =>
        $@"<th style=""text-align:left;padding:8px 10px;background:#1F2937;color:#F9FAFB;border-top:1px solid #374151;border-bottom:1px solid #374151;border-left:1px solid #374151;"">{Html(text)}</th>";

    private static string Td(string? text) =>
        $@"<td style=""padding:8px 10px;background:#111827;color:#E5E7EB;border-bottom:1px solid #374151;border-left:1px solid #374151;vertical-align:top;"">{Html(text)}</td>";

    private static string Li(string? text) =>
        $@"<li style=""display:flex;gap:8px;align-items:flex-start;margin:8px 0;"">
              <span style=""display:inline-flex;width:18px;height:18px;border-radius:999px;background:#7C3AED;color:#fff;align-items:center;justify-content:center;font-size:12px;margin-top:2px;flex:0 0 auto;"">✓</span>
              <span style=""color:#E5E7EB;"">{Html(text)}</span>
           </li>";
}