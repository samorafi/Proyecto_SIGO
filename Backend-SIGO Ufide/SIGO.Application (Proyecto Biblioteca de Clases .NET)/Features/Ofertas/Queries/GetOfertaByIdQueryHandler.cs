using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Queries;

public class GetOfertaByIdQueryHandler : IRequestHandler<GetOfertaByIdQuery, OfertaResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public GetOfertaByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<OfertaResponseDto?> Handle(GetOfertaByIdQuery request, CancellationToken ct)
    {
        var o = await _db.Ofertas.FirstOrDefaultAsync(x => x.OfertaId == request.OfertaId, ct);
        if (o is null) return null;

        return new OfertaResponseDto
        {
            OfertaId = o.OfertaId,
            CursoId = o.CursoId,
            SedeId = o.SedeId,
            ModalidadId = o.ModalidadId,
            HorarioId = o.HorarioId,
            PeriodoId = o.PeriodoId,
            AccionId = o.AccionId,
            CoordinadorId = o.CoordinadorId,
            Comentarios = o.Comentarios
        };
    }
}
