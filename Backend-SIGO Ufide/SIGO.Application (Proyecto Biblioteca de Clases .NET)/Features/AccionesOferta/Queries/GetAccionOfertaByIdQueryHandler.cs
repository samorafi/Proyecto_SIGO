using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.AccionesOferta.Dto;

namespace SIGO.Application.Features.AccionesOferta.Queries;

public sealed class GetAccionOfertaByIdQueryHandler
    : IRequestHandler<GetAccionOfertaByIdQuery, AccionOfertaResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetAccionOfertaByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<AccionOfertaResponseDto?> Handle(GetAccionOfertaByIdQuery request, CancellationToken ct)
        => await _db.AccionesOferta.AsNoTracking()
            .Where(x => x.AccionId == request.Id)
            .Select(x => new AccionOfertaResponseDto { AccionId = x.AccionId, Nombre = x.Nombre })
            .FirstOrDefaultAsync(ct);
}
