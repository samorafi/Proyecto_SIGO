using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.ConfigSmtp.Queries.Get;
using System.Net;
using System.Net.Mail;

namespace SIGO.Infrastructure.Services.Email
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly IMediator _mediator;

        public SmtpEmailSender(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task SendHtmlAsync(string toEmail, string subject, string htmlBody, CancellationToken ct)
        {
            var conf = await _mediator.Send(new GetConfSmtpQuery(), ct);

            if (string.IsNullOrWhiteSpace(conf.Username) || string.IsNullOrWhiteSpace(conf.Password))
                throw new InvalidOperationException("La configuración SMTP no tiene usuario o contraseña configurados.");

            using var message = new MailMessage
            {
                From = new MailAddress(conf.SenderEmail, conf.SenderName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(toEmail));

            using var client = new SmtpClient(conf.Host, conf.Port)
            {
                EnableSsl = conf.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            client.Credentials = new NetworkCredential(conf.Username, conf.Password);

            await client.SendMailAsync(message, ct);
        }
    }
}