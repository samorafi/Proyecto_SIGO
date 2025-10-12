using MediatR;
using SIGO.Application.Abstractions;
using System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Persona.Commands.Deactivate
{
    public class DeactivatePersonaCommandHandler : IRequestHandler<DeactivatePersonaCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeactivatePersonaCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeactivatePersonaCommand request, CancellationToken cancellationToken)
        {
            var persona = await _context.Personas.FindAsync(new object[] { request.Id }, cancellationToken);

            if (persona is null)
            {
                return false; 
            }

            // 1. Actualiza el estado Inactivo' (ID 2 es 'Inactivo').
            persona.EstadoPersonaId = 2;

        
            persona.MotivoDesvinculacionId = request.MotivoDesvinculacionId;
            persona.PeriodoDesvinculacionId = request.PeriodoDesvinculacionId;

  
            string currentDate = DateTime.Now.ToString("dd/MM/yyyy");
            persona.Comentarios += $"\n[DEACTIVATED ON {currentDate}]: {request.Comentarios}";

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}