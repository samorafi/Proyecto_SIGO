using SIGO.Application.Abstractions;
using BCrypt.Net;

namespace SIGO.Application.Services
{
    public class BCryptHashService : IHashService
    {
        // Se recomienda un factor de trabajo (work factor) de 12 o superior.
        private const int WORK_FACTOR = 12;

        public string HashPassword(string password)
        {
            // BCrypt genera el "salt" (sal) automáticamente dentro del hash
            return BCrypt.Net.BCrypt.HashPassword(password, WORK_FACTOR);
        }

        public bool VerifyPassword(string password, string storedHash)
        {
            // Verifica la contraseña contra el hash almacenado
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
    }
}
