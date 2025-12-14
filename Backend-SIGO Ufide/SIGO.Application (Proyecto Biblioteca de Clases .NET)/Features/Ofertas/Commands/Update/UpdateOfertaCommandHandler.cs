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

        var oldCursoId = entity.CursoId;
        var oldSedeId = entity.SedeId;
        var oldModalidadId = entity.ModalidadId;
        var oldPeriodoId = entity.PeriodoId;

        entity.CursoId = ToNullIfZero(r.CursoId);
        entity.SedeId = ToNullIfZero(r.SedeId);
        entity.ModalidadId = ToNullIfZero(r.ModalidadId);
        entity.HorarioId = r.HorarioId;
        entity.PeriodoId = ToNullIfZero(r.PeriodoId);
        entity.AccionId = ToNullIfZero(r.AccionId);
        entity.CoordinadorId = ToNullIfZero(r.CoordinadorId);
        entity.Comentarios = r.Comentarios;
        entity.EstadoOfertaId = ToNullIfZero(r.EstadoOfertaId);
        entity.Cupo = r.Cupo;
        entity.Matriculados = r.Matriculados;
        entity.Archivados = r.Archivados;
        entity.PersonaId = ToNullIfZero(r.PersonaId);

        var newCursoId = entity.CursoId;
        var newSedeId = entity.SedeId;
        var newModalidadId = entity.ModalidadId;
        var newPeriodoId = entity.PeriodoId;

        var combinationChanged =
            oldCursoId != newCursoId ||
            oldSedeId != newSedeId ||
            oldModalidadId != newModalidadId ||
            oldPeriodoId != newPeriodoId;

        if (combinationChanged)
        {
            var maxGrupo = await _db.Ofertas
                .Where(o =>
                    o.OfertaId != entity.OfertaId &&
                    o.CursoId == newCursoId &&
                    o.SedeId == newSedeId &&
                    o.ModalidadId == newModalidadId &&
                    o.PeriodoId == newPeriodoId)
                .MaxAsync(o => (int?)o.Grupo, ct);

            entity.Grupo = (maxGrupo ?? 0) + 1;
        }

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }

    private static int? ToNullIfZero(int? v) => (v.HasValue && v.Value > 0) ? v : null;
}
