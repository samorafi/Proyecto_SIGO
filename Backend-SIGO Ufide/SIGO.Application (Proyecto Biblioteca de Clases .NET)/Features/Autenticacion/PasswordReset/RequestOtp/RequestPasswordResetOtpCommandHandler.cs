using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Autenticacion.PasswordReset.RequestOtp.Dto;
using SIGO.Domain.Entities;
using System.Net;

namespace SIGO.Application.Features.Autenticacion.PasswordReset.RequestOtp
{
    public class RequestPasswordResetOtpCommandHandler
        : IRequestHandler<RequestPasswordResetOtpCommand, RequestOtpResultDto>
    {
        private readonly IApplicationDbContext _db;
        private readonly IOtpGenerator _otpGen;
        private readonly IHashService _hashService;
        private readonly IEmailSender _emailSender;

        private const int COOLDOWN_SECONDS = 60;
        private const int OTP_MINUTES = 4;
        private const string GENERIC_MSG = "Si el correo existe, se ha enviado un código de recuperación.";

        public RequestPasswordResetOtpCommandHandler(
            IApplicationDbContext db,
            IOtpGenerator otpGen,
            IHashService hashService,
            IEmailSender emailSender)
        {
            _db = db;
            _otpGen = otpGen;
            _hashService = hashService;
            _emailSender = emailSender;
        }

        public async Task<RequestOtpResultDto> Handle(RequestPasswordResetOtpCommand request, CancellationToken ct)
        {
            var now = DateTimeOffset.UtcNow;
            var correo = request.Correo?.Trim() ?? "";

            // Anti-enumeración
            if (string.IsNullOrWhiteSpace(correo))
                return new RequestOtpResultDto { Sent = false, Message = GENERIC_MSG };

            var user = await _db.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo, ct);

            // Anti-enumeración
            if (user == null || !user.Activo)
                return new RequestOtpResultDto { Sent = false, Message = GENERIC_MSG };

            // Buscar último OTP "no usado" (para cooldown)
            var last = await _db.PasswordResetOtps
                .Where(x => x.UsuarioId == user.UsuarioId && x.UsedAt == null)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(ct);

            // Cooldown anti-spam (60s)
            if (last?.LastSentAt is not null)
            {
                var elapsed = (now - last.LastSentAt.Value).TotalSeconds;
                if (elapsed < COOLDOWN_SECONDS)
                {
                    var remaining = (int)Math.Ceiling(COOLDOWN_SECONDS - elapsed);
                    return new RequestOtpResultDto
                    {
                        Sent = false,
                        CooldownSeconds = remaining,
                        Message = $"Debes esperar {remaining} segundos para solicitar un nuevo código."
                    };
                }
            }

            // Anular cualquier OTP pendiente (used_at == null), expirado o no
            // Esto garantiza que solo el nuevo quede activo.
            var pending = await _db.PasswordResetOtps
                .Where(x => x.UsuarioId == user.UsuarioId && x.UsedAt == null)
                .ToListAsync(ct);

            if (pending.Count > 0)
            {
                foreach (var p in pending)
                    p.UsedAt = now;

                await _db.SaveChangesAsync(ct);
            }

            // Generar OTP nuevo
            var otp = _otpGen.GenerateNumeric(6);
            var otpHash = _hashService.HashPassword(otp);
            var expiresAt = now.AddMinutes(OTP_MINUTES);

            _db.PasswordResetOtps.Add(new PasswordResetOtp
            {
                UsuarioId = user.UsuarioId,
                OtpHash = otpHash,
                CreatedAt = now,
                ExpiresAt = expiresAt,
                Attempts = 0,
                UsedAt = null,
                LastSentAt = now
            });

            await _db.SaveChangesAsync(ct);

            // Enviar correo
            var subject = "Recuperación de contraseña - SIGO";

            var bodyHtml = $@"
<!doctype html>
<html>
  <body style=""margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;"">
    <div style=""display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;"">
      Tu código de recuperación expira en {OTP_MINUTES} minutos.
    </div>

    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background:#F3F4F6;padding:24px 12px;"">
      <tr>
        <td align=""center"">

          <!-- Contenedor -->
          <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);"">

            <!-- Header -->
            <tr>
              <td style=""background:#2B338C;padding:18px 20px;"">
                <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"">
                  <tr>
                    <td style=""color:#ffffff;font-weight:800;font-size:16px;letter-spacing:0.2px;"">
                      SIGO · Universidad Fidélitas
                    </td>
                    <td align=""right"">
                      <span style=""display:inline-block;background:#FFDA00;color:#2B338C;font-weight:800;font-size:12px;padding:6px 10px;border-radius:999px;"">
                        Recuperación
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style=""padding:22px 20px 6px 20px;color:#111827;"">
                <h2 style=""margin:0 0 8px 0;font-size:18px;line-height:1.3;color:#111827;"">
                  Hola {WebUtility.HtmlEncode(user.Nombre)},
                </h2>

                <p style=""margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#374151;"">
                  Recibimos una solicitud para restablecer tu contraseña. Usá el siguiente código para continuar:
                </p>

                <!-- Caja OTP -->
                <div style=""background:#F8FAFC;border:1px solid #E5E7EB;border-radius:14px;padding:14px 14px;margin:0 0 10px 0;"">
                  <div style=""font-size:12px;color:#6B7280;margin-bottom:6px;font-weight:700;letter-spacing:0.6px;"">
                    CÓDIGO (OTP)
                  </div>

                  <div style=""text-align:center;font-size:34px;font-weight:900;letter-spacing:8px;color:#2B338C;padding:6px 0;"">
                    {WebUtility.HtmlEncode(otp)}
                  </div>

                  <div style=""text-align:center;font-size:12px;color:#6B7280;margin-top:4px;"">
                    Expira en <b style=""color:#111827;"">{OTP_MINUTES} minutos</b>
                  </div>
                </div>

                <!-- Nota -->
                <div style=""background:#FFF7CC;border:1px solid #FFDA00;border-radius:12px;padding:12px 12px;margin:0 0 12px 0;"">
                  <div style=""font-size:13px;line-height:1.5;color:#2B338C;"">
                    <b>Importante:</b> No compartas este código con nadie.
                  </div>
                </div>

                <p style=""margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#374151;"">
                  Si no solicitaste este cambio, podés ignorar este correo con total tranquilidad.
                </p>
              </td>
            </tr>

            <tr>
              <td style=""padding:0 20px;"">
                <div style=""height:1px;background:#E5E7EB;""></div>
              </td>
            </tr>

            <tr>
              <td style=""padding:14px 20px 18px 20px;color:#6B7280;font-size:12px;line-height:1.5;"">
                <div style=""margin-bottom:6px;"">
                  Este mensaje fue enviado automáticamente por <b style=""color:#111827;"">SIGO</b>.
                </div>
                <div style=""color:#9CA3AF;"">
                  © {DateTime.UtcNow.Year} Universidad Fidélitas · Todos los derechos reservados
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>";

            await _emailSender.SendHtmlAsync(user.Correo, subject, bodyHtml, ct);

            return new RequestOtpResultDto
            {
                Sent = true,
                Message = GENERIC_MSG
            };
        }
    }
}