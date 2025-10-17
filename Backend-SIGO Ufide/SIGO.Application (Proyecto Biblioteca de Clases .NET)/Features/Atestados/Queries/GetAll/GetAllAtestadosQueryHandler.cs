using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Atestados.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Atestados.Queries.GetAll
{
    public class GetAllAtestadosQueryHandler : IRequestHandler<GetAllAtestadosQuery, IEnumerable<AtestadoDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllAtestadosQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AtestadoDto>> Handle(GetAllAtestadosQuery request, CancellationToken cancellationToken)
        {
            var atestados = await _context.Atestados.ToListAsync(cancellationToken);
            return atestados.Select(AtestadoDto.FromEntity);
        }
    }
}
