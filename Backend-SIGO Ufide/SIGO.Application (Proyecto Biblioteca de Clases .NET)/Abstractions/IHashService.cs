using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Application.Abstractions
{
    // Funcionalidad de hashing de contraseñas
    public interface IHashService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string storedHash);
    }
}
