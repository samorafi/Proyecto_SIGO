using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.RolesDocente.Dto;

namespace SIGO.Application.Features.RolesDocente.Queries;

public sealed class GetRolesDocenteQueryHandler
    : IRequestHandler<GetRolesDocenteQuery, List<RolDocenteResponseDto>>
{
    private readonly IApplicationDbContext _db;
    public GetRolesDocenteQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<RolDocenteResponseDto>> Handle(GetRolesDocenteQuery request, CancellationToken ct)
        => await _db.RolesDocente.AsNoTracking()
            .OrderBy(r => r.Nombre)
            .Select(r => new RolDocenteResponseDto { RolId = r.RolId, Nombre = r.Nombre })
            .ToListAsync(ct);
}
