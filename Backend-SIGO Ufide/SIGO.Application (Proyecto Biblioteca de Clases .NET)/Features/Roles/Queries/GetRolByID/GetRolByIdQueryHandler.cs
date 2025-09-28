using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Roles.Dto;

namespace SIGO.Application.Features.Roles.Queries.GetRolById
{
    public class GetRolByIdQueryHandler : IRequestHandler<GetRolByIdQuery, RolDto>
    {
        private readonly IApplicationDbContext _context;

        public GetRolByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RolDto> Handle(GetRolByIdQuery request, CancellationToken cancellationToken)
        {
            var rol = await _context.Roles
                .Include(r => r.RolPermisos)
                .ThenInclude(rp => rp.Permiso)
                .FirstOrDefaultAsync(r => r.RolId == request.RolId, cancellationToken);

            if (rol == null) return null;

            return new RolDto
            {
                RolId = rol.RolId,
                Nombre = rol.Nombre,
                Permisos = rol.RolPermisos.Select(rp => rp.Permiso.Clave).ToList()
            };
        }
    }
}
