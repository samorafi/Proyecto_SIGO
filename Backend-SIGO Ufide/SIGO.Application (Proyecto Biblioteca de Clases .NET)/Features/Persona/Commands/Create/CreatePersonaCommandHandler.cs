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
            var entity = new Domain.Entities.Persona
            {
                Nombre = request.Nombre,
                Cedula = request.Cedula,
                Correo = request.Correo,
                Telefono = request.Telefono,
                FechaIngreso = request.FechaIngreso,
                Comentarios = request.Comentarios,

                GeneroId = request.GeneroId,
                ProvinciaId = request.ProvinciaId,
                CantonId = request.CantonId,
                CategoriaId = request.CategoriaId,
                AtestadoId = request.AtestadoId,
                TipoContratoId = request.TipoContratoId,
                RolDocenteId = request.RolDocenteId,

                EstadoPersonaId = 1,
                MotivoDesvinculacionId = null,
                PeriodoDesvinculacionId = null,

                EnLinea = request.EnLinea ?? false
            };

            _context.Personas.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return entity.Id;
        }
    }
}