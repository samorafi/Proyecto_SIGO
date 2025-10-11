using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using System.Collections.Generic;

namespace SIGO.Application.Features.Ofertas.Queries;

public sealed class GetAllOfertasQueryHandler
    : IRequestHandler<GetAllOfertasQuery, List<OfertaResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetAllOfertasQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<OfertaResponseDto>> Handle(GetAllOfertasQuery request, CancellationToken ct)
    {
        return await _db.Ofertas
            .AsNoTracking()
            .OrderByDescending(o => o.PeriodoId).ThenBy(o => o.CursoId) // orden sugerido
            .Select(o => new OfertaResponseDto
            {
                OfertaId = o.OfertaId,
                CursoId = o.CursoId,
                SedeId = o.SedeId,
                ModalidadId = o.ModalidadId,
                HorarioId = o.HorarioId,
                PeriodoId = o.PeriodoId,
                AccionId = o.AccionId,
                CoordinadorId = o.CoordinadorId,
                Comentarios = o.Comentarios
            })
            .ToListAsync(ct);
    }
}
