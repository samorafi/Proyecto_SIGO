using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using DomainPersona = SIGO.Domain.Entities.Persona;

namespace SIGO.Application.Features.Persona.Commands.Update
{
    public class UpdatePersonaCommandHandler : IRequestHandler<UpdatePersonaCommand>
    {
        private readonly IApplicationDbContext _context;
        public UpdatePersonaCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task Handle(UpdatePersonaCommand request, CancellationToken cancellationToken)
        {
            var persona = await _context.Personas
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (persona is null) return;

            persona.Nombre = request.Nombre;
            persona.PrimerApellido = request.PrimerApellido;
            persona.SegundoApellido = request.SegundoApellido;
            persona.Cedula = request.Cedula;
            persona.Correo = request.Correo;
            persona.Telefono = request.Telefono;
            persona.Comentarios = request.Comentarios;

            if (request.PeriodoIngresoId.HasValue)
                persona.PeriodoIngresoId = request.PeriodoIngresoId.Value;

            persona.GeneroId = request.GeneroId;
            persona.ProvinciaId = request.ProvinciaId;
            persona.CantonId = request.CantonId;
            persona.CategoriaId = request.CategoriaId;
            persona.AtestadoId = request.AtestadoId;
            persona.EstadoPersonaId = request.EstadoPersonaId;
            persona.TipoContratoId = request.TipoContratoId;
            persona.RolDocenteId = request.RolDocenteId;
            persona.MotivoDesvinculacionId = request.MotivoDesvinculacionId;
            persona.PeriodoDesvinculacionId = request.PeriodoDesvinculacionId;

            if (request.EnLinea.HasValue)
                persona.EnLinea = request.EnLinea.Value;

            persona.SedeId = request.SedeId;

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
