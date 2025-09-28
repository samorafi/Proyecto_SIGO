using MediatR;

namespace SIGO.Application.Features.Usuarios.Commands.Update
{
    public class UpdateUsuarioCommand : IRequest<bool>
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } 
        public string Correo { get; set; } 
        public string Contrasena { get; set; } 
        public bool Activo { get; set; }
    }
}
