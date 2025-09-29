using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Persona.DTO;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Persona.Queries.GetById
{
    public class GetPersonaByIdQueryHandler : IRequestHandler<GetPersonaByIdQuery, PersonaDto?>
    {
        private readonly IApplicationDbContext _context;

        public GetPersonaByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PersonaDto?> Handle(GetPersonaByIdQuery request, CancellationToken cancellationToken)
        {
            var persona = await _context.Personas
                .Include(p => p.Genero)
                .Include(p => p.Provincia)
                .Include(p => p.Canton)
                .Include(p => p.CategoriaDocente)
                .Include(p => p.EstadoPersona)
                .Include(p => p.TipoContrato)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            return persona == null ? null : PersonaDto.FromEntity(persona);//Si la variable persona es null (lo que significa que no se
                                                                           //encontró a la
                                                                           //persona en la base de datos), el método devuelve null.
        }
    }
}