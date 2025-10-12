using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Horarios.Dto;

namespace SIGO.Application.Features.Horarios.Queries;

public sealed class GetHorariosQueryHandler
    : IRequestHandler<GetHorariosQuery, List<HorarioResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetHorariosQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<HorarioResponseDto>> Handle(GetHorariosQuery request, CancellationToken ct)
        => await _db.Horarios.AsNoTracking()
            .OrderBy(x => x.Dia).ThenBy(x => x.Rango)
            .Select(x => new HorarioResponseDto
            {
                HorarioId = x.HorarioId,
                Dia = x.Dia,
                Rango = x.Rango
            })
            .ToListAsync(ct);
}
