using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Ofertas.Commands.QuitarAsistenteOferta
{
    public class QuitarAsistenteOfertaCommandHandler : IRequestHandler<QuitarAsistenteOfertaCommand>
    {
        private readonly IApplicationDbContext _context;

        public QuitarAsistenteOfertaCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(QuitarAsistenteOfertaCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.OfertaAsistentes
                .FirstOrDefaultAsync(
                    x => x.OfertaId == request.OfertaId && x.PersonaId == request.PersonaId,
                    cancellationToken);

            if (entity == null)
                return;

            _context.OfertaAsistentes.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}