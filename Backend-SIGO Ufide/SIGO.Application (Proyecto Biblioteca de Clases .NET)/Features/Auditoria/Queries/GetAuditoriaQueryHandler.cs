using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Auditoria.Dto;
using SIGO.Application.Models.Common;
using System.Text.Json;

namespace SIGO.Application.Features.Auditoria.Queries
{
    public class GetAuditoriaQueryHandler : IRequestHandler<GetAuditoriaQuery, PagedResponse<BitacoraAuditoriaDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAuditoriaQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<BitacoraAuditoriaDto>> Handle(GetAuditoriaQuery request, CancellationToken ct)
        {
            var q = request.Params;
            var query = _context.BitacoraAuditorias.AsNoTracking().AsQueryable();

            // Filtros
            if (!string.IsNullOrWhiteSpace(q.Tabla))
                query = query.Where(x => x.TablaAfectada != null && x.TablaAfectada.ToLower() == q.Tabla.ToLower());

            if (q.RegistroId.HasValue)
                query = query.Where(x => x.RegistroId == q.RegistroId);

            if (!string.IsNullOrWhiteSpace(q.Usuario))
                query = query.Where(x => x.Usuario != null &&
                    x.Usuario.ToLower().Contains(q.Usuario.ToLower()));

            if (!string.IsNullOrWhiteSpace(q.Accion))
                query = query.Where(x => x.Accion != null && x.Accion.ToLower() == q.Accion.ToLower());

            if (q.FechaInicio.HasValue)
                query = query.Where(x => x.Fecha >= q.FechaInicio.Value);

            if (q.FechaFin.HasValue)
                query = query.Where(x => x.Fecha <= q.FechaFin.Value);

            // Orden
            var sortBy = (q.SortBy ?? "fecha").ToLower();
            var sortDir = (q.SortDir ?? "desc").ToLower();

            query = (sortBy, sortDir) switch
            {
                ("usuario", "asc") => query.OrderBy(x => x.Usuario),
                ("usuario", "desc") => query.OrderByDescending(x => x.Usuario),
                ("tabla", "asc") => query.OrderBy(x => x.TablaAfectada),
                ("tabla", "desc") => query.OrderByDescending(x => x.TablaAfectada),
                ("accion", "asc") => query.OrderBy(x => x.Accion),
                ("accion", "desc") => query.OrderByDescending(x => x.Accion),
                ("fecha", "asc") => query.OrderBy(x => x.Fecha),
                _ => query.OrderByDescending(x => x.Fecha)
            };

            // Paginación
            var page = Math.Max(1, q.Page);
            var size = Math.Clamp(q.PageSize, 1, 100);
            var total = await query.LongCountAsync(ct);

            var data = await query.Skip((page - 1) * size).Take(size).ToListAsync(ct);

            var items = data.Select(x => new BitacoraAuditoriaDto
            {
                Id = x.Id,
                Usuario = x.Usuario,
                TablaAfectada = x.TablaAfectada,
                Accion = x.Accion,
                RegistroId = x.RegistroId,
                ValoresAnteriores = TryParseJson(x.ValoresAnteriores),
                ValoresNuevos = TryParseJson(x.ValoresNuevos),
                IpOrigen = x.IpOrigen,
                Descripcion = x.Descripcion,
                Fecha = x.Fecha
            });

            return new PagedResponse<BitacoraAuditoriaDto>
            {
                Page = page,
                PageSize = size,
                Total = total,
                Items = items
            };
        }

        private static JsonElement? TryParseJson(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            try
            {
                using var doc = JsonDocument.Parse(s);
                return doc.RootElement.Clone();
            }
            catch
            {
                return null;
            }
        }
    }
}
