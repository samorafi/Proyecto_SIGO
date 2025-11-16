using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using System.Linq;

namespace SIGO.Application.Features.Ofertas.Queries;

public class GetAllOfertasQueryHandler : IRequestHandler<GetAllOfertasQuery, IReadOnlyList<OfertaResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetAllOfertasQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<OfertaResponseDto>> Handle(GetAllOfertasQuery request, CancellationToken ct)
    {
        return await _db.Ofertas
            .AsNoTracking()
            .Select(o => new OfertaResponseDto
            {
                OfertaId = o.OfertaId,
                Curso = o.Curso != null ? o.Curso.Codigo : null,
                Sede = o.Sede != null ? o.Sede.Nombre : null,
                Modalidad = o.Modalidad != null ? o.Modalidad.Nombre : null,
                HorarioId = o.HorarioId,
                Periodo = o.Periodo != null ? o.Periodo.Etiqueta : null,
                Accion = o.Accion != null ? o.Accion.Nombre : null,
                CoordinadorId = o.CoordinadorId,
                Comentarios = o.Comentarios,
                Estado = o.EstadoOferta != null ? o.EstadoOferta.Nombre : null,
                Grupo = o.Grupo,
                Cupo = o.Cupo,
                Matriculados = o.Matriculados
            })
            .ToListAsync(ct);
    }
}
