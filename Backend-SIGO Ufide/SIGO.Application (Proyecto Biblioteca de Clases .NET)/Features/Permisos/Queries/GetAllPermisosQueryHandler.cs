using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Permisos.Dto;

namespace SIGO.Application.Features.Permisos.Queries.GetAll
{
    public class GetAllPermisosQueryHandler : IRequestHandler<GetAllPermisosQuery, List<PermisoDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllPermisosQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<PermisoDto>> Handle(GetAllPermisosQuery request, CancellationToken cancellationToken)
        {
            return await _context.Permisos
                .Select(p => new PermisoDto
                {
                    PermisoId = p.PermisoId,
                    Nombre = p.Nombre,
                    Clave = p.Clave,
                    Ruta = p.Ruta
                })
                .ToListAsync(cancellationToken);
        }
    }
}
