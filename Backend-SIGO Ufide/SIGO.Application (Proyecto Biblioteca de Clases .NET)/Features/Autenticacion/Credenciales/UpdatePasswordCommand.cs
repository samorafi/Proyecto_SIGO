using MediatR;

namespace SIGO.Application.Features.Autenticacion.Credenciales
{
    public class UpdatePasswordCommand : IRequest<bool>
    {
        public int UsuarioId { get; set; }
        public string Contrasena { get; set; }
    }
}
