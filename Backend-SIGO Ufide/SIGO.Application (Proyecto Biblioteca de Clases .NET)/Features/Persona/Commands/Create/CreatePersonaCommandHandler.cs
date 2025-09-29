using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;
using PersonaEntity = SIGO.Domain.Entities.Persona;

namespace SIGO.Application.Features.Personas.Commands.Create
{
    public class CreatePersonaCommandHandler : IRequestHandler<CreatePersonaCommand, int>
    {
        private readonly IApplicationDbContext _context;

        public CreatePersonaCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreatePersonaCommand request, CancellationToken cancellationToken)
        {
            var persona = new PersonaEntity
            {
                // Mapeo de todos los campos desde el command
                Nombre = request.Nombre,
                Cedula = request.Cedula,
                Correo = request.Correo,
                Telefono = request.Telefono,
                FechaIngreso = request.FechaIngreso ?? DateTime.UtcNow, // Si no viene fecha, pone la actual
                Comentarios = request.Comentarios,
                GeneroId = request.GeneroId,
                ProvinciaId = request.ProvinciaId,
                CantonId = request.CantonId,
                CategoriaId = request.CategoriaId,
                EstadoPersonaId = request.EstadoPersonaId,
                TipoContratoId = request.TipoContratoId,
                MotivoDesvinculacionId = request.MotivoDesvinculacionId,
                PeriodoDesvinculacionId = request.PeriodoDesvinculacionId
            };

            _context.Personas.Add(persona);
            await _context.SaveChangesAsync(cancellationToken);

            return persona.Id;
        }
    }
}