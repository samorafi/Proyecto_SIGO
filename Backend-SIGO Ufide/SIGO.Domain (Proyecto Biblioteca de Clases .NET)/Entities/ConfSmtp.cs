namespace SIGO.Domain.Entities
{
    public class ConfSmtp
    {
        public int Id { get; set; }
        public string Host { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
        public string? SenderName { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool UseDefaultCredentials { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
