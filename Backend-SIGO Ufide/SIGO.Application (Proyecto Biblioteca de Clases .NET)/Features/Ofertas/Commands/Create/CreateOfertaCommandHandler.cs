using MediatR;
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

        var entity = new Oferta
        {
            CursoId = ToNullIfZero(r.CursoId),
            SedeId = ToNullIfZero(r.SedeId),
            ModalidadId = ToNullIfZero(r.ModalidadId),
            HorarioId = r.HorarioId,
            PeriodoId = ToNullIfZero(r.PeriodoId),
            AccionId = ToNullIfZero(r.AccionId),
            CoordinadorId = ToNullIfZero(r.CoordinadorId),
            Comentarios = r.Comentarios,
            EstadoOfertaId = ToNullIfZero(r.EstadoOfertaId)
        };

        _db.Ofertas.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.OfertaId;
    }

    private static int? ToNullIfZero(int? v) => (v.HasValue && v.Value > 0) ? v : null;
}
