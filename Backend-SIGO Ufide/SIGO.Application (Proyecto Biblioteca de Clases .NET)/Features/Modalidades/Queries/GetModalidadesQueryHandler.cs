using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Modalidades.Dto;

namespace SIGO.Application.Features.Modalidades.Queries;

public sealed class GetModalidadesQueryHandler
    : IRequestHandler<GetModalidadesQuery, List<ModalidadResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetModalidadesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<ModalidadResponseDto>> Handle(GetModalidadesQuery request, CancellationToken ct)
        => await _db.Modalidades.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => new ModalidadResponseDto { ModalidadId = x.ModalidadId, Nombre = x.Nombre })
            .ToListAsync(ct);
}
