using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Notificaciones.Commands.MarcarLeida;

public class MarcarNotificacionLeidaCommandHandler : IRequestHandler<MarcarNotificacionLeidaCommand, bool>
{
    private readonly IApplicationDbContext _db;

    public MarcarNotificacionLeidaCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<bool> Handle(MarcarNotificacionLeidaCommand request, CancellationToken ct)
    {
        var n = await _db.Notificaciones
            .FirstOrDefaultAsync(x => x.NotificacionId == request.NotificacionId, ct);

        if (n is null) return false;

        if (!n.Leido)
        {
            n.Leido = true;
            await _db.SaveChangesAsync(ct);
        }

        return true;
    }
}
