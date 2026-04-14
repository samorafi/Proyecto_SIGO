using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Pagination;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;

namespace SIGO.Application.Features.Ofertas.Queries.ObtenerOfertas;

public sealed class GetOfertasPagedQueryHandler
    : IRequestHandler<GetOfertasPagedQuery, PagedResult<OfertaResponseDto>>
{
    private static readonly int[] AllowedPageSizes = { 10, 25, 50, 100 };

    private readonly IApplicationDbContext _db;
    public GetOfertasPagedQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<OfertaResponseDto>> Handle(GetOfertasPagedQuery request, CancellationToken ct)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = AllowedPageSizes.Contains(request.PageSize) ? request.PageSize : 10;

        var query = _db.Ofertas
            .AsNoTracking()
            .AsQueryable();

        query = request.Category switch
        {
            OfertaCategory.PresencialVirtual => query.Where(o =>
                o.Archivados == false && (o.ModalidadId == 1 || o.ModalidadId == 2)),

            OfertaCategory.EnLinea => query.Where(o =>
                o.Archivados == false && o.ModalidadId == 3),

            OfertaCategory.Historico => query.Where(o =>
                o.Archivados == true),

            _ => query
        };

        if (!string.IsNullOrWhiteSpace(request.Buscar))
        {
            var q = request.Buscar.Trim();
            var isGrupo = int.TryParse(q, out var grupo);

            query = query.Where(o =>
                isGrupo && o.Grupo == grupo
                ||
                o.Curso != null && (
                    (o.Curso.Codigo ?? "").Contains(q) ||
                    (o.Curso.Nombre ?? "").Contains(q)
                ) ||
                o.Coordinador != null &&
                    ((o.Coordinador.Nombre ?? "") + " " +
                     (o.Coordinador.PrimerApellido ?? "") + " " +
                     (o.Coordinador.SegundoApellido ?? ""))
                    .Contains(q)
            );
        }

        if (request.SedeId.HasValue)
            query = query.Where(o => o.SedeId == request.SedeId.Value);

        if (request.ModalidadId.HasValue)
            query = query.Where(o => o.ModalidadId == request.ModalidadId.Value);

        if (request.PeriodoId.HasValue)
            query = query.Where(o => o.PeriodoId == request.PeriodoId.Value);

        if (request.AccionId.HasValue)
            query = query.Where(o => o.AccionId == request.AccionId.Value);

        if (request.EstadoOfertaId.HasValue)
            query = query.Where(o => o.EstadoOfertaId == request.EstadoOfertaId.Value);

        if (request.HorarioId.HasValue)
        {
            query = query.Where(o => o.HorarioId == request.HorarioId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(request.Dia))
        {
            query = query.Where(o => o.Horario != null && o.Horario.Dia.StartsWith(request.Dia));
        }

        if (!string.IsNullOrWhiteSpace(request.Dia))
            query = query.Where(o => o.Horario != null && o.Horario.Dia.StartsWith(request.Dia));

        var totalCount = await query.CountAsync(ct);

        query = query.OrderByDescending(o => o.OfertaId);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OfertaResponseDto
            {
                OfertaId = o.OfertaId,
                Cursoid = o.Curso != null ? o.Curso.Codigo : null,
                Curso = o.Curso != null ? o.Curso.Nombre : null,
                Sede = o.Sede != null ? o.Sede.Nombre : null,
                Modalidad = o.Modalidad != null ? o.Modalidad.Nombre : null,

                HorarioId = o.HorarioId,
                HorarioDia = o.Horario != null && !string.IsNullOrEmpty(o.Horario.Dia)
                    ? o.Horario.Dia.Substring(0, 1)
                    : null,
                HorarioHora = o.Horario != null ? o.Horario.Rango : null,

                PeriodoId = o.PeriodoId,
                Periodo = o.Periodo != null ? o.Periodo.Etiqueta : null,

                Accion = o.Accion != null ? o.Accion.Nombre : null,

                CoordinadorId = o.CoordinadorId,
                Coordinador = o.Coordinador != null
                    ? ((o.Coordinador.Nombre ?? "") + " " +
                       (o.Coordinador.PrimerApellido ?? "") + " " +
                       (o.Coordinador.SegundoApellido ?? "")).Trim()
                    : null,

                Comentarios = o.Comentarios,
                Estado = o.EstadoOferta != null ? o.EstadoOferta.Nombre : null,
                Grupo = o.Grupo,
                Cupo = o.Cupo,
                Matriculados = o.Matriculados,
                Archivados = o.Archivados,
                PersonaId = o.PersonaId
            })
            .ToListAsync(ct);

        return new PagedResult<OfertaResponseDto>(items, page, pageSize, totalCount);
    }
}