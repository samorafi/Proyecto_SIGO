using MediatR;
using SIGO.Application.Abstractions;
using DomainPersona = SIGO.Domain.Entities.Persona;

namespace SIGO.Application.Features.Persona.Commands.Create
{
    public class CreatePersonaCommandHandler : IRequestHandler<CreatePersonaCommand, int>
    {
        private readonly IApplicationDbContext _context;
        public CreatePersonaCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task<int> Handle(CreatePersonaCommand request, CancellationToken cancellationToken)
        {
            var entity = new DomainPersona
            {
                Nombre = request.Nombre,
                PrimerApellido = request.PrimerApellido,
                SegundoApellido = request.SegundoApellido,
                Cedula = request.Cedula,
                Correo = request.Correo,
                Telefono = request.Telefono,
                Comentarios = request.Comentarios,

                PeriodoIngresoId = request.PeriodoIngresoId,

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

                EnLinea = request.EnLinea ?? false,
                SedeId = request.SedeId
            };

            _context.Personas.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return entity.Id;
        }
    }
}
