namespace SIGO.Domain.Entities
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
        public int AccessFailedCount { get; set; } = 0; // Contador para los intentos fallidos de acceso
        public DateTimeOffset? LockoutEnd { get; set; } = null; // Fecha y hora hasta la que está bloqueado
        public bool LockoutEnabled { get; set; } = true; // Indica si el bloqueo está habilitado
    }
}
