using MediatR;
using SIGO.Application.Features.Usuarios.Dto;

namespace SIGO.Application.Features.Autenticacion.Login
{
    public class LoginCommand : IRequest<UsuarioDto?>
    {
        public string Correo { get; }
        public string Contrasena { get; }

        public LoginCommand(string correo, string contrasena)
        {
            Correo = correo;
            Contrasena = contrasena;
        }
    }
}
