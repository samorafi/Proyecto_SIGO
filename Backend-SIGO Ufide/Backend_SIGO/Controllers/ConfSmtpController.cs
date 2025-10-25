using MailKit.Net.Smtp;
using MailKit.Security;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using MimeKit.Text;
using SIGO.Application.Features.ConfigSmtp.Commands.CreateOrUpdate;
using SIGO.Application.Features.ConfigSmtp.DTO;
using SIGO.Application.Features.ConfigSmtp.Queries.Get;

namespace SIGO.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConfSmtpController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConfSmtpController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                var result = await _mediator.Send(new GetConfSmtpQuery());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateAsync([FromBody] CreateConfSmtpRequest request)
        {
            try
            {
                var command = new CreateOrUpdateConfSmtpCommand(request);
                var result = await _mediator.Send(command);

                return Ok(new
                {
                    success = true,
                    message = "Configuración SMTP guardada correctamente.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestConnectionAsync([FromBody] TestSmtpRequest request)
        {
            try
            {
                // Obtener configuración SMTP desde la BD
                var settings = await _mediator.Send(new GetConfSmtpQuery());

                if (string.IsNullOrWhiteSpace(request.ToEmail))
                    return BadRequest(new { success = false, message = "Debe ingresar un correo de destino." });

                // Crear mensaje con MimeKit
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    string.IsNullOrWhiteSpace(settings.SenderName) ? "Sistema SIGO" : settings.SenderName,
                    string.IsNullOrWhiteSpace(settings.SenderEmail) ? settings.Username : settings.SenderEmail
                ));
                message.To.Add(MailboxAddress.Parse(request.ToEmail));
                message.Subject = "Correo de prueba de conexión SMTP";
                message.Body = new TextPart(TextFormat.Plain)
                {
                    Text = "La conexión SMTP fue exitosa desde SIGO utilizando la configuración dinámica."
                };

                using (var client = new MailKit.Net.Smtp.SmtpClient())
                {
                    // IMPORTANTE: Se desactiva la validación estricta del certificado (Solamente para etapa de desarrollo)
                    client.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;

                    // Función de selección del tipo de conexión según los datos de la BD
                    SecureSocketOptions socketOption = SecureSocketOptions.None;

                    if (settings.EnableSsl)
                    {
                        socketOption = (settings.Port == 465)
                            ? SecureSocketOptions.SslOnConnect   // SSL directo
                            : SecureSocketOptions.StartTls;      // STARTTLS
                    }

                    // Función de conexión a SMTP
                    await client.ConnectAsync(settings.Host, settings.Port, socketOption);

                    // Función de Autenticación SMTP
                    await client.AuthenticateAsync(settings.Username, settings.Password);

                    // Enviar el correo
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                return Ok(new
                {
                    success = true,
                    message = $"Correo de prueba enviado correctamente a {request.ToEmail}."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("EXCEPCIÓN SMTP COMPLETA:");
                Console.WriteLine(ex.ToString());

                return BadRequest(new
                {
                    success = false,
                    message = $"Error SMTP: {ex.Message}"
                });
            }
        }


    }

}
