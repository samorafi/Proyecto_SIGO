using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Ofertas.Commands.AgregarAsistenteOferta
{
    public class AgregarAsistenteOfertaCommandHandler : IRequestHandler<AgregarAsistenteOfertaCommand>
    {
        private readonly IApplicationDbContext _context;

        public AgregarAsistenteOfertaCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(AgregarAsistenteOfertaCommand request, CancellationToken cancellationToken)
        {
            var ofertaExiste = await _context.Ofertas
                .AnyAsync(o => o.OfertaId == request.OfertaId, cancellationToken);

            if (!ofertaExiste)
                throw new KeyNotFoundException("La oferta no existe.");

            var personaExiste = await _context.Personas
                .AnyAsync(p => p.Id == request.PersonaId, cancellationToken);

            if (!personaExiste)
                throw new KeyNotFoundException("La persona no existe.");

            var yaExiste = await _context.OfertaAsistentes
                .AnyAsync(x => x.OfertaId == request.OfertaId && x.PersonaId == request.PersonaId, cancellationToken);

            if (yaExiste)
                return;

            _context.OfertaAsistentes.Add(new OfertaAsistente
            {
                OfertaId = request.OfertaId,
                PersonaId = request.PersonaId
            });

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}