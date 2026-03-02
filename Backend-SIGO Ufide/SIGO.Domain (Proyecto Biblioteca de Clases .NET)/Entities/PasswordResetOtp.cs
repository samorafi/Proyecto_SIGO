namespace SIGO.Domain.Entities
{
    public class PasswordResetOtp
    {
        public int PasswordResetOtpId { get; set; }

        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        public string OtpHash { get; set; } = string.Empty;

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }

        public int Attempts { get; set; } = 0;
        public DateTimeOffset? UsedAt { get; set; }

        public DateTimeOffset? LastSentAt { get; set; }
    }
}