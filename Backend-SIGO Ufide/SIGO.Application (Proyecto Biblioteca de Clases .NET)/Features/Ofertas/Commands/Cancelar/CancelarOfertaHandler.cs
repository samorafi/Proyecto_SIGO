using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Ofertas.Commands.Cancelar;

public class CancelarOfertaCommandHandler : IRequestHandler<CancelarOfertaCommand, bool>
{
    private readonly IApplicationDbContext _db;
    public CancelarOfertaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<bool> Handle(CancelarOfertaCommand request, CancellationToken ct)
    {
        var oferta = await _db.Ofertas
            .FirstOrDefaultAsync(o => o.OfertaId == request.OfertaId, ct);

        if (oferta is null) return false;

        if (oferta.EstadoOfertaId == 5) return false;

        oferta.EstadoOfertaId = 5;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
