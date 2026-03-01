using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Cantones.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Cantones.Queries.GetAll
{
    public class GetAllCantonesQueryHandler : IRequestHandler<GetAllCantonesQuery, IEnumerable<CantonDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllCantonesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CantonDto>> Handle(GetAllCantonesQuery request, CancellationToken cancellationToken)
        {
            var cantones = await _context.Cantones.ToListAsync(cancellationToken);
            return cantones.Select(CantonDto.FromEntity);
        }
    }
}