using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Ofertas.Commands.AsignarAsistentes;

public sealed class AsignarAsistentesOfertaCommandHandler
    : IRequestHandler<AsignarAsistentesOfertaCommand, Unit>
{
    private readonly IApplicationDbContext _db;

    public AsignarAsistentesOfertaCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(AsignarAsistentesOfertaCommand request, CancellationToken ct)
    {
        var oferta = await _db.Ofertas
            .Include(o => o.OfertaAsistentes)
            .FirstOrDefaultAsync(o => o.OfertaId == request.OfertaId, ct);

        if (oferta is null)
            throw new NotFoundException("Oferta", request.OfertaId);

        // En Línea = ModalidadId 3
        if (oferta.ModalidadId != 3)
            throw new BadRequestException("Solo las ofertas 100% virtuales permiten profesores asistentes.");

        var personaIds = (request.PersonaIds ?? new List<int>())
            .Where(x => x > 0)
            .Distinct()
            .ToList();

        if (oferta.PersonaId.HasValue && personaIds.Contains(oferta.PersonaId.Value))
            throw new BadRequestException("El profesor principal no puede asignarse como asistente en la misma oferta.");

        if (personaIds.Count > 0)
        {
            var personasValidas = await _db.Personas
                .Where(p => personaIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync(ct);

            var faltantes = personaIds.Except(personasValidas).ToList();

            if (faltantes.Count > 0)
                throw new BadRequestException("Uno o más docentes asistentes no existen.");
        }

        if (oferta.OfertaAsistentes.Any())
            _db.OfertaAsistentes.RemoveRange(oferta.OfertaAsistentes);

        if (personaIds.Count > 0)
        {
            var nuevos = personaIds.Select(personaId => new OfertaAsistente
            {
                OfertaId = oferta.OfertaId,
                PersonaId = personaId
            });

            await _db.OfertaAsistentes.AddRangeAsync(nuevos, ct);
        }

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}