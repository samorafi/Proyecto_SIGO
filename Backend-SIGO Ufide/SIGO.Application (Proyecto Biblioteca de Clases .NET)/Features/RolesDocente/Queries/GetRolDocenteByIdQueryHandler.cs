using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.RolesDocente.Dto;

namespace SIGO.Application.Features.RolesDocente.Queries;

public sealed class GetRolDocenteByIdQueryHandler
    : IRequestHandler<GetRolDocenteByIdQuery, RolDocenteResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetRolDocenteByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<RolDocenteResponseDto?> Handle(GetRolDocenteByIdQuery request, CancellationToken ct)
        => await _db.RolesDocente.AsNoTracking()
            .Where(r => r.RolId == request.Id)
            .Select(r => new RolDocenteResponseDto { RolId = r.RolId, Nombre = r.Nombre })
            .FirstOrDefaultAsync(ct);
}
