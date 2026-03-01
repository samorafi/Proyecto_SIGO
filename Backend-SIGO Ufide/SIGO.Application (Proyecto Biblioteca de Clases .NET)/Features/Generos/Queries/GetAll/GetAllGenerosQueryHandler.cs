using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Generos.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Generos.Queries.GetAll
{
    public class GetAllGenerosQueryHandler : IRequestHandler<GetAllGenerosQuery, IEnumerable<GeneroDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllGenerosQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<GeneroDto>> Handle(GetAllGenerosQuery request, CancellationToken cancellationToken)
        {
            var generos = await _context.Generos.ToListAsync(cancellationToken);
            return generos.Select(GeneroDto.FromEntity);
        }
    }
}