using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;

namespace SIGO.Application.Features.Ofertas.Commands.Update;

public class UpdateOfertaCommandHandler : IRequestHandler<UpdateOfertaCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    public UpdateOfertaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<Unit> Handle(UpdateOfertaCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var entity = await _db.Ofertas
            .FirstOrDefaultAsync(x => x.OfertaId == request.OfertaId, ct) 
            ?? throw new NotFoundException("Oferta", request.OfertaId);

        entity.CursoId = ToNullIfZero(r.CursoId);
        entity.SedeId = ToNullIfZero(r.SedeId);
        entity.ModalidadId = ToNullIfZero(r.ModalidadId);
        entity.HorarioId = r.HorarioId;
        entity.PeriodoId = ToNullIfZero(r.PeriodoId);
        entity.AccionId = ToNullIfZero(r.AccionId);
        entity.CoordinadorId = ToNullIfZero(r.CoordinadorId);
        entity.Comentarios = r.Comentarios;
        entity.EstadoOfertaId = ToNullIfZero(r.EstadoOfertaId);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }

    private static int? ToNullIfZero(int? v) => (v.HasValue && v.Value > 0) ? v : null;
}
