using MediatR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using DomainPersona = SIGO.Domain.Entities.Persona;

namespace SIGO.Application.Features.Persona.Commands.Create
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
            var cedula = request.Cedula?.Trim();

            var cedulaExiste = await _context.Personas
                .AnyAsync(p => p.Cedula == cedula, cancellationToken);

            if (cedulaExiste)
            {
                throw new BadRequestException("Ya existe un docente con esa cédula.");
            }

            var entity = new DomainPersona
            {
                Nombre = request.Nombre,
                PrimerApellido = request.PrimerApellido,
                SegundoApellido = request.SegundoApellido,
                Cedula = cedula,
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

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                return entity.Id;
            }
            catch (DbUpdateException ex) when (
                ex.InnerException is PostgresException postgresEx &&
                postgresEx.SqlState == PostgresErrorCodes.UniqueViolation &&
                postgresEx.ConstraintName == "persona_cedula_key")
            {
                throw new BadRequestException("Ya existe un docente con esa cédula.");
            }
        }
    }
}