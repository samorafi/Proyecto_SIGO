namespace SIGO.Application.Abstractions
{
    public interface IEmailSender
    {
        Task SendHtmlAsync(string toEmail, string subject, string htmlBody, CancellationToken ct);
    }
}