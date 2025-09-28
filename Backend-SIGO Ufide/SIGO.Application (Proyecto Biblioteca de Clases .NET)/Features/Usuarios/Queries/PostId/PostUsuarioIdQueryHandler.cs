using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Usuarios.Dto;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Usuarios.Queries.GetId
{
    public class PostUsuarioLoginQueryHandler : IRequestHandler<PostUsuarioLoginQuery, UsuarioDto?>
    {
        // Incluir el contexto de la base de datos
        private readonly IApplicationDbContext _context;

        // Pendiente de implementar: incluir Seguridad de ****PasswordHasher<Usuario>****
        // cuando estén listos los cambios de hasheo.

        // Constructor
        public PostUsuarioLoginQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        // Metodo asincronico para manejar la consulta de login
        public async Task<UsuarioDto?> Handle(PostUsuarioLoginQuery request, CancellationToken cancellationToken)
        {
            // Funcion de busqueda del usuario por correo
            var user = await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Correo == request.Correo, cancellationToken);

            // Si no se encuentra el usuario, retornar null
            if (user == null) return null;

            // Pendiente de implementar: Al incluir seguridad de cifrado, se debe remplazar
            // por PasswordHasher<Usuario>.VerifyHashedPassword(...) en cuanto se el hasher.

            if (user.Contrasena != request.Contrasena)
            {
                return null;
            }

            // IMPORTANTE: Se mapea a DTO, con el fin de NUNCA devolver la contraseña.
            return new UsuarioDto(user.UsuarioId, user.Nombre, user.Correo, user.Activo);
        }
    }
}
