using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Services;

namespace SIGO.Application.Features.Usuarios.Commands.Update
{
    public class UpdateUsuarioCommandHandler : IRequestHandler<UpdateUsuarioCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IHashService _hashService;

        public UpdateUsuarioCommandHandler(IApplicationDbContext context, IHashService hashService)
        {
            _context = context;
            _hashService = hashService;
        }

        public async Task<bool> Handle(UpdateUsuarioCommand request, CancellationToken cancellationToken)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.UsuarioId == request.UsuarioId, cancellationToken);

            if (usuario == null)
                return false;

            usuario.Nombre = request.Nombre;
            usuario.Correo = request.Correo;
            usuario.Activo = request.Activo;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
