using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Persona.Commands.Delete
{
    public class DeletePersonaCommandHandler : IRequestHandler<DeletePersonaCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private const int EstadoInactivoId = 2;

        public DeletePersonaCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeletePersonaCommand request, CancellationToken cancellationToken)
        {
            var persona = await _context.Personas.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (persona == null)
            {
                return false;
            }

            persona.EstadoPersonaId = EstadoInactivoId;
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}