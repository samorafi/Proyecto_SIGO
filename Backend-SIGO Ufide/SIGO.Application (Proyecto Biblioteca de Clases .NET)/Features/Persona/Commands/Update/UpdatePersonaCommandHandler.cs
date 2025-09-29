using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using System.Threading;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Persona.Commands.Update
{
    public class UpdatePersonaCommandHandler : IRequestHandler<UpdatePersonaCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdatePersonaCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(UpdatePersonaCommand request, CancellationToken cancellationToken)
        {
            var persona = await _context.Personas.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (persona == null)
            {
                return;
            }

            // Mapeo de los campos a actualizar
            persona.Nombre = request.Nombre;
            persona.Cedula = request.Cedula;
            persona.Correo = request.Correo;
            persona.Telefono = request.Telefono;
            persona.FechaIngreso = request.FechaIngreso;
            persona.Comentarios = request.Comentarios;
            persona.GeneroId = request.GeneroId;
            persona.ProvinciaId = request.ProvinciaId;
            persona.CantonId = request.CantonId;
            persona.CategoriaId = request.CategoriaId;
            persona.EstadoPersonaId = request.EstadoPersonaId;
            persona.TipoContratoId = request.TipoContratoId;
            persona.MotivoDesvinculacionId = request.MotivoDesvinculacionId;
            persona.PeriodoDesvinculacionId = request.PeriodoDesvinculacionId;

            await _context.SaveChangesAsync(cancellationToken);

        }
    }
}
