using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using System.ComponentModel.DataAnnotations;

namespace SIGO.Application.Features.Ofertas.Commands.Update;

public class UpdateOfertaCommandHandler_v2 : IRequestHandler<UpdateOfertaCommand_v2, Unit>
{
    private readonly IApplicationDbContext _db;
    public UpdateOfertaCommandHandler_v2(IApplicationDbContext db) => _db = db;

    public async Task<Unit> Handle(UpdateOfertaCommand_v2 request, CancellationToken ct)
    {
        var r = request.Data;

        var entity = await _db.Ofertas
            .FirstOrDefaultAsync(x => x.OfertaId == request.OfertaId, ct)
            ?? throw new NotFoundException("Oferta", request.OfertaId);

        // Grupo requerido
        if (r.Grupo <= 0)
            throw new ValidationException("El grupo es requerido y debe ser mayor a 0.");

        // Evitar duplicado de grupo dentro de la misma combinación
        var grupoDuplicado = await _db.Ofertas.AnyAsync(o =>
            o.OfertaId != entity.OfertaId &&
            o.CursoId == entity.CursoId &&
            o.SedeId == entity.SedeId &&
            o.ModalidadId == entity.ModalidadId &&
            o.PeriodoId == entity.PeriodoId &&
            o.Grupo == r.Grupo,
            ct);

        if (grupoDuplicado)
            throw new ValidationException($"El grupo {r.Grupo} ya está asignado para esta oferta.");

        // Solo editables
        entity.HorarioId = r.HorarioId;
        entity.AccionId = ToNullIfZero(r.AccionId);
        entity.CoordinadorId = ToNullIfZero(r.CoordinadorId);
        entity.Comentarios = r.Comentarios;
        entity.Cupo = r.Cupo;
        entity.Matriculados = r.Matriculados;
        entity.Grupo = r.Grupo;

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }

    private static int? ToNullIfZero(int? v) => (v.HasValue && v.Value > 0) ? v : null;
}
