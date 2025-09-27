// Objeto que recibe la API cuando se quiera registrar un usuario.

using MediatR;

namespace SIGO.Application.Features.Usuarios.Commands.Create
{
    public class CreateUsuarioCommand : IRequest<int>
    {
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }
}
