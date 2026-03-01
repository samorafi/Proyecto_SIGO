namespace SIGO.Application.Features.ConfigSmtp.DTO
{
    public class CreateConfSmtpRequest
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? SenderName { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool UseDefaultCredentials { get; set; }
    }
}
