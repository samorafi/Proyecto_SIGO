using MediatR;
using SIGO.Application.Abstractions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Persona.Commands.Activate
{
    //Clase con logica para reactivar un usuario
    public class ActivatePersonaCommandHandler : IRequestHandler<ActivatePersonaCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public ActivatePersonaCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(ActivatePersonaCommand request, CancellationToken cancellationToken)
        {
            var persona = await _context.Personas.FindAsync(new object[] { request.Id }, cancellationToken);

            if (persona is null)
            {
                return false;
            }

            // 1. Se actualiza a  'Activo' ( ID 1 es 'Activo').
            persona.EstadoPersonaId = 1;

            // 2. Al activar un docente, se elimina el porque se inactivo y se elimina el periodo de Desvinuclacion.
            persona.MotivoDesvinculacionId = null;
            persona.PeriodoDesvinculacionId = null;

            // 3. Se añade un comentario de que se reactivo el docente con la fecha y hora en el sistema.
            string currentDate = DateTime.Now.ToString("dd/MM/yyyy");
            persona.Comentarios += $"\n[REACTIVATED ON {currentDate}]: El docente se ha reactivado en el sistema.";

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}