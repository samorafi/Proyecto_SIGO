using MediatR;

namespace SIGO.Application.Features.Usuarios.Commands.Update
{
    public class UpdateUsuarioCommand : IRequest<bool>
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }
}
