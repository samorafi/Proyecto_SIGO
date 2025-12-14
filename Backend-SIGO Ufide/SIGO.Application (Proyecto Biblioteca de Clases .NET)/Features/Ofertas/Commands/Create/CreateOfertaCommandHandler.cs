using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Ofertas.Commands.Create;

public class CreateOfertaCommandHandler : IRequestHandler<CreateOfertaCommand, int>
{
    private readonly IApplicationDbContext _db;
    public CreateOfertaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<int> Handle(CreateOfertaCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var cursoId = ToNullIfZero(r.CursoId);
        var sedeId = ToNullIfZero(r.SedeId);
        var modalidadId = ToNullIfZero(r.ModalidadId);
        var periodoId = ToNullIfZero(r.PeriodoId);

        var maxGrupo = await _db.Ofertas
            .Where(o =>
                o.CursoId == cursoId &&
                o.SedeId == sedeId &&
                o.ModalidadId == modalidadId &&
                o.PeriodoId == periodoId)
            .MaxAsync(o => (int?)o.Grupo, ct);

        var nextGrupo = (maxGrupo ?? 0) + 1;

        var entity = new Oferta
        {
            CursoId = cursoId,
            SedeId = sedeId,
            ModalidadId = modalidadId,
            HorarioId = r.HorarioId,
            PeriodoId = periodoId,
            AccionId = ToNullIfZero(r.AccionId),
            CoordinadorId = ToNullIfZero(r.CoordinadorId),
            Comentarios = r.Comentarios,
            EstadoOfertaId = ToNullIfZero(r.EstadoOfertaId),

            Grupo = nextGrupo,
            Cupo = r.Cupo,
            Matriculados = r.Matriculados,
            Archivados = r.Archivados,
            PersonaId = ToNullIfZero(r.PersonaId)
        };

        _db.Ofertas.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.OfertaId;
    }

    private static int? ToNullIfZero(int? v) => (v.HasValue && v.Value > 0) ? v : null;
}
