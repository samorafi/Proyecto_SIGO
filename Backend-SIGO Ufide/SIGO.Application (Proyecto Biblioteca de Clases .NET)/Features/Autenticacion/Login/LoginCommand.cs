using MediatR;
using SIGO.Application.Features.Usuarios.Dto;

namespace SIGO.Application.Features.Autenticacion.Login
{
    public class LoginCommand : IRequest<UsuarioDto?>
    {
        public string Correo { get; set; }
        public string Contrasena { get; set; }
    }
}
