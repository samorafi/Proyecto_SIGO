using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Application.Abstrations
{
    public interface IJwtProvider
    {
        string GenerateToken(int usuarioId, string correo, List<string> roles, List<string> permisos);
    }
}
