using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Notificaciones.DTOs;

namespace SIGO.Application.Features.Notificaciones.Queries.Listar;

public class GetNotificacionesQueryHandler : IRequestHandler<GetNotificacionesQuery, GetNotificacionesResponse>
{
    private readonly IApplicationDbContext _db;

    public GetNotificacionesQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<GetNotificacionesResponse> Handle(GetNotificacionesQuery request, CancellationToken ct)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize is <= 0 or > 200 ? 20 : request.PageSize;

        var q = _db.Notificaciones.AsNoTracking().AsQueryable();

        if (request.PersonaId.HasValue && request.PersonaId.Value > 0)
            q = q.Where(x => x.PersonaId == request.PersonaId.Value);

        if (request.SoloNoLeidas == true)
            q = q.Where(x => !x.Leido);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            q = q.Where(x => x.Mensaje.ToLower().Contains(s));
        }

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(x => x.FechaCreacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new NotificacionDto
            {
                NotificacionId = x.NotificacionId,
                PersonaId = x.PersonaId,
                OfertaId = x.OfertaId,
                SolicitudOfertaId = x.SolicitudOfertaId,
                Leido = x.Leido,
                Mensaje = x.Mensaje,
                FechaCreacion = x.FechaCreacion,
                FechaEvento = x.FechaEvento
            })
            .ToListAsync(ct);

        return new GetNotificacionesResponse { Total = total, Items = items };
    }

}
