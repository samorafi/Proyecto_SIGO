using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.EstadosPersona.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.EstadosPersona.Queries.GetAll
{
    public class GetAllEstadosPersonaQueryHandler : IRequestHandler<GetAllEstadosPersonaQuery, IEnumerable<EstadoPersonaDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllEstadosPersonaQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EstadoPersonaDto>> Handle(GetAllEstadosPersonaQuery request, CancellationToken cancellationToken)
        {
            var estados = await _context.EstadosPersonas.ToListAsync(cancellationToken);
            return estados.Select(EstadoPersonaDto.FromEntity);
        }
    }
}