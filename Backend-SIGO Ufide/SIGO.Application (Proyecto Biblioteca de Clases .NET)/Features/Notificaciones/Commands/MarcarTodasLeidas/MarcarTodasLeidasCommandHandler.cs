using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Notificaciones.Commands.MarcarTodasLeidas;

public class MarcarTodasLeidasCommandHandler : IRequestHandler<MarcarTodasLeidasCommand, int>
{
    private readonly IApplicationDbContext _db;

    public MarcarTodasLeidasCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<int> Handle(MarcarTodasLeidasCommand request, CancellationToken ct)
    {
        var notis = await _db.Notificaciones
            .Where(x => !x.Leido)
            .ToListAsync(ct);

        foreach (var n in notis)
            n.Leido = true;

        await _db.SaveChangesAsync(ct);
        return notis.Count;
    }
}
