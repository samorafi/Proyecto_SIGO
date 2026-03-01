using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Horarios.Dto;

namespace SIGO.Application.Features.Horarios.Queries;

public sealed class GetHorarioByIdQueryHandler
    : IRequestHandler<GetHorarioByIdQuery, HorarioResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetHorarioByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<HorarioResponseDto?> Handle(GetHorarioByIdQuery request, CancellationToken ct)
        => await _db.Horarios.AsNoTracking()
            .Where(x => x.HorarioId == request.Id)
            .Select(x => new HorarioResponseDto
            {
                HorarioId = x.HorarioId,
                Dia = x.Dia,
                Rango = x.Rango
            })
            .FirstOrDefaultAsync(ct);
}
