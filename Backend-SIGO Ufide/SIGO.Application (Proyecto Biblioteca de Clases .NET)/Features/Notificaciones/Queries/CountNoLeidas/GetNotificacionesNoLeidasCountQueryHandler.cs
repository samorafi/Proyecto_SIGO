using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Notificaciones.Queries.CountNoLeidas;

public class GetNotificacionesNoLeidasCountQueryHandler : IRequestHandler<GetNotificacionesNoLeidasCountQuery, int>
{
    private readonly IApplicationDbContext _db;

    public GetNotificacionesNoLeidasCountQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<int> Handle(GetNotificacionesNoLeidasCountQuery request, CancellationToken ct)
    {
        var q = _db.Notificaciones.AsNoTracking().Where(x => !x.Leido);

        if (request.PersonaId.HasValue && request.PersonaId.Value > 0)
            q = q.Where(x => x.PersonaId == request.PersonaId.Value);

        return await q.CountAsync(ct);
    }

}
