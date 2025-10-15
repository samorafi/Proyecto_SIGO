using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Provincias.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Provincias.Queries.GetAll
{
    public class GetAllProvinciasQueryHandler : IRequestHandler<GetAllProvinciasQuery, IEnumerable<ProvinciaDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllProvinciasQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProvinciaDto>> Handle(GetAllProvinciasQuery request, CancellationToken cancellationToken)
        {
            var provincias = await _context.Provincias.ToListAsync(cancellationToken);
            return provincias.Select(ProvinciaDto.FromEntity);
        }
    }
}