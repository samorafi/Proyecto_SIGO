using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Persona.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

//manejar la consulta para obtener todas las personas.

namespace SIGO.Application.Features.Persona.Queries.GetAll
{
    public class GetAllPersonasQueryHandler : IRequestHandler<GetAllPersonasQuery, IEnumerable<PersonaDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllPersonasQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PersonaDto>> Handle(GetAllPersonasQuery request, CancellationToken cancellationToken)
        {
            var personas = await _context.Personas
                .Include(p => p.Genero)
                .Include(p => p.Provincia)
                .Include(p => p.Canton)
                .Include(p => p.CategoriaDocente)
                .Include(p => p.EstadoPersona)
                .Include(p => p.TipoContrato)
                .ToListAsync(cancellationToken);//Convierte los Resultados en una Lista

            return personas.Select(PersonaDto.FromEntity);
        }
    }
}