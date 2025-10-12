using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Grados.Dto;

namespace SIGO.Application.Features.Grados.Queries;

public sealed class GetGradoByIdQueryHandler
    : IRequestHandler<GetGradoByIdQuery, GradoResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetGradoByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<GradoResponseDto?> Handle(GetGradoByIdQuery request, CancellationToken ct)
        => await _db.Grados.AsNoTracking()
            .Where(x => x.GradoId == request.Id)
            .Select(x => new GradoResponseDto { GradoId = x.GradoId, Nombre = x.Nombre })
            .FirstOrDefaultAsync(ct);
}
