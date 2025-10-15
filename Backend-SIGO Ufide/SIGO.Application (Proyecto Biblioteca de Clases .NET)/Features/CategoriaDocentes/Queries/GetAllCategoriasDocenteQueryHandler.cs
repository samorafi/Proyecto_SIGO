using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.CategoriaDocentes.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.CategoriaDocentes.Queries.GetAll
{
    public class GetAllCategoriasDocenteQueryHandler : IRequestHandler<GetAllCategoriasDocenteQuery, IEnumerable<CategoriaDocenteDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllCategoriasDocenteQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoriaDocenteDto>> Handle(GetAllCategoriasDocenteQuery request, CancellationToken cancellationToken)
        {
            var categorias = await _context.CategoriasDocentes.ToListAsync(cancellationToken);
            return categorias.Select(CategoriaDocenteDto.FromEntity);
        }
    }
}
