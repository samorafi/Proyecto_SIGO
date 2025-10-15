using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.MotivosDesvinculacion.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.MotivosDesvinculacion.Queries.GetAll
{
    public class GetAllMotivosDesvinculacionQueryHandler : IRequestHandler<GetAllMotivosDesvinculacionQuery, IEnumerable<MotivoDesvinculacionDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllMotivosDesvinculacionQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MotivoDesvinculacionDto>> Handle(GetAllMotivosDesvinculacionQuery request, CancellationToken cancellationToken)
        {
            var motivos = await _context.MotivosDesvinculacion.ToListAsync(cancellationToken);
            return motivos.Select(MotivoDesvinculacionDto.FromEntity);
        }
    }
}