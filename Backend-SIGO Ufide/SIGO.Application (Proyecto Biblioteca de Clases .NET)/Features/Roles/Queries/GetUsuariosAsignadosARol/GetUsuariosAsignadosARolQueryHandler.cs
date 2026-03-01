using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetUsuariosAsignadosARol
{
    public class GetUsuariosAsignadosARolQueryHandler
        : IRequestHandler<GetUsuariosAsignadosARolQuery, List<UsuarioAsignadoRolDto>>
    {
        private readonly IApplicationDbContext _db;

        public GetUsuariosAsignadosARolQueryHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<UsuarioAsignadoRolDto>> Handle(GetUsuariosAsignadosARolQuery request, CancellationToken ct)
        {
            var usuarios = await _db.UsuarioRoles
                .Where(ur => ur.RolId == request.RolId)
                .Join(_db.Usuarios,           
                      ur => ur.UsuarioId,
                      u => u.UsuarioId, 
                      (ur, u) => new UsuarioAsignadoRolDto
                      {
                          UsuarioId = u.UsuarioId,
                          Nombre = u.Nombre,
                          Correo = u.Correo
                      })
                .OrderBy(x => x.Nombre)
                .ToListAsync(ct);

            return usuarios;
        }
    }
}
