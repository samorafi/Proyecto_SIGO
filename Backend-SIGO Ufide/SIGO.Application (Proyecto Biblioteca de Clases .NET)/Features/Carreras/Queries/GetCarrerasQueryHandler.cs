using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Carreras.Dto;

namespace SIGO.Application.Features.Carreras.Queries;

public sealed class GetCarrerasQueryHandler : IRequestHandler<GetCarrerasQuery, List<CarreraResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetCarrerasQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<CarreraResponseDto>> Handle(GetCarrerasQuery request, CancellationToken ct)
    {
        var q = _db.Carreras.AsNoTracking().AsQueryable();
        if (request.Estado.HasValue) q = q.Where(x => x.Estado == request.Estado.Value);

        return await q.OrderBy(x => x.Nombre)
            .Select(x => new CarreraResponseDto { CarreraId = x.CarreraId, Nombre = x.Nombre, Estado = x.Estado })
            .ToListAsync(ct);
    }
}
