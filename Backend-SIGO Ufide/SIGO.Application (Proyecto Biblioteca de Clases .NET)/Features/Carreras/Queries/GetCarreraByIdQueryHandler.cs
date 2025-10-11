using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Carreras.Dto;

namespace SIGO.Application.Features.Carreras.Queries;

public sealed class GetCarreraByIdQueryHandler : IRequestHandler<GetCarreraByIdQuery, CarreraResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetCarreraByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<CarreraResponseDto?> Handle(GetCarreraByIdQuery request, CancellationToken ct)
        => await _db.Carreras.AsNoTracking()
            .Where(x => x.CarreraId == request.Id)
            .Select(x => new CarreraResponseDto { CarreraId = x.CarreraId, Nombre = x.Nombre, Estado = x.Estado })
            .FirstOrDefaultAsync(ct);
}
