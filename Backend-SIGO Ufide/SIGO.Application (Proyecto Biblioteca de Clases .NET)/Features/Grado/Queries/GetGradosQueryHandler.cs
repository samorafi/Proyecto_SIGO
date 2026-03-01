using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Grados.Dto;

namespace SIGO.Application.Features.Grados.Queries;

public sealed class GetGradosQueryHandler
    : IRequestHandler<GetGradosQuery, List<GradoResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetGradosQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<GradoResponseDto>> Handle(GetGradosQuery request, CancellationToken ct)
        => await _db.Grados.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => new GradoResponseDto { GradoId = x.GradoId, Nombre = x.Nombre })
            .ToListAsync(ct);
}
