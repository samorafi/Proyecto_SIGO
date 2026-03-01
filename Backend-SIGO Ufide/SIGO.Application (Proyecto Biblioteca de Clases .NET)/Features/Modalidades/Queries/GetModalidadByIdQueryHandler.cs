using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Modalidades.Dto;

namespace SIGO.Application.Features.Modalidades.Queries;

public sealed class GetModalidadByIdQueryHandler
    : IRequestHandler<GetModalidadByIdQuery, ModalidadResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetModalidadByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<ModalidadResponseDto?> Handle(GetModalidadByIdQuery request, CancellationToken ct)
        => await _db.Modalidades.AsNoTracking()
            .Where(x => x.ModalidadId == request.Id)
            .Select(x => new ModalidadResponseDto { ModalidadId = x.ModalidadId, Nombre = x.Nombre })
            .FirstOrDefaultAsync(ct);
}
