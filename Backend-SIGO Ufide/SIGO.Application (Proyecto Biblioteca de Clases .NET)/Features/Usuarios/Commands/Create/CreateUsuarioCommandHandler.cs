using MediatR;
using Microsoft.EntityFrameworkCore;
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
            // Validamos antes de guardar
            var exists = await _context.Usuarios
                .AnyAsync(u => u.Correo.ToLower() == request.Correo.ToLower(), cancellationToken);

            if (exists)
            {
                // Retornamos un valor especial o lanzamos un mensaje controlado
                return -1; // <-- Indicador de que ya existe
            }

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
