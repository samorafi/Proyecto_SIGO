namespace SIGO.Domain.Entities
{
    public class PasswordResetToken
    {
        public Guid TokenId { get; set; }

        public int UsuarioId { get; set; }

        public Usuario Usuario { get; set; } = null!;

        public string SecretHash { get; set; } = string.Empty;

        public DateTimeOffset CreatedAt { get; set; }

        public DateTimeOffset ExpiresAt { get; set; }
        
        public DateTimeOffset? UsedAt { get; set; }
    }
}