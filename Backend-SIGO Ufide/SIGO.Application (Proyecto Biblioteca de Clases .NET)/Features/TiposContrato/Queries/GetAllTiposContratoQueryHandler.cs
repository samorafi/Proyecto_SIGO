using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.TiposContrato.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.TiposContrato.Queries.GetAll
{
    public class GetAllTiposContratoQueryHandler : IRequestHandler<GetAllTiposContratoQuery, IEnumerable<TipoContratoDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllTiposContratoQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TipoContratoDto>> Handle(GetAllTiposContratoQuery request, CancellationToken cancellationToken)
        {
            var tipos = await _context.TiposContratos.ToListAsync(cancellationToken);
            return tipos.Select(TipoContratoDto.FromEntity);
        }
    }
}
