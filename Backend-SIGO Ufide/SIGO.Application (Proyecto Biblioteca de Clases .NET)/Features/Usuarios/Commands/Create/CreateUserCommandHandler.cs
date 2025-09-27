
// Manejador que ejecuta la lógica de crear el usuario en la DB

using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Usuarios.Commands.Create
{
    public class CreateUsuarioCommandHandler : IRequestHandler<CreateUsuarioCommand, int>
    {
        private readonly IApplicationDbContext _context;

        public CreateUsuarioCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateUsuarioCommand request, CancellationToken cancellationToken)
        {
            var usuario = new Usuario
            {
                Nombre = request.Nombre,
                Correo = request.Correo,
                Contrasena = request.Contrasena,
                Activo = true
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync(cancellationToken);

            return usuario.UsuarioId;
        }
    }
}
