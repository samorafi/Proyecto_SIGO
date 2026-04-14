using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Autenticacion.Credenciales;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Application__Proyecto_Biblioteca_de_Clases_.NET_.Features.Autenticacion.Credenciales
{
    public class UpdatePasswordCommandHandler : IRequestHandler<UpdatePasswordCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IHashService _hashService;

        public UpdatePasswordCommandHandler(IApplicationDbContext context, IHashService hashService)
        {
            _context = context;
            _hashService = hashService;
        }

        public async Task<bool> Handle(UpdatePasswordCommand request, CancellationToken cancellationToken)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.UsuarioId == request.UsuarioId, cancellationToken);

            if (usuario == null)
                return false;

            if (!string.IsNullOrWhiteSpace(request.Contrasena))

            {

                usuario.PasswordHash = _hashService.HashPassword(request.Contrasena);

            }

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
