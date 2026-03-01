using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Roles.Commands.Create
{
    public class CreateRolCommandHandler : IRequestHandler<CreateRolCommand, int>
    {
        private readonly IApplicationDbContext _context;

        public CreateRolCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateRolCommand request, CancellationToken cancellationToken)
        {
            var rol = new Rol { Nombre = request.Nombre };

            _context.Roles.Add(rol);
            await _context.SaveChangesAsync(cancellationToken);

            foreach (var permisoId in request.PermisosIds)
            {
                _context.RolPermisos.Add(new RolPermiso
                {
                    RolId = rol.RolId,
                    PermisoId = permisoId
                });
            }

            await _context.SaveChangesAsync(cancellationToken);
            return rol.RolId;
        }
    }
}
