using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Ofertas.Commands.Update;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Validation;

public sealed class UpdateOfertaCommandHandler : IRequestHandler<UpdateOfertaCommand, OfertaResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public UpdateOfertaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<OfertaResponseDto?> Handle(UpdateOfertaCommand request, CancellationToken ct)
    {
        var id = request.Id;
        var r = request.Data;

        var entity = await _db.Ofertas.FirstOrDefaultAsync(o => o.OfertaId == id, ct);
        if (entity is null) return null; // controller devolverá 404

        var fkErrors = await OfertaFkValidator.ValidateUpdateAsync(
            _db, r.CursoId, r.SedeId, r.ModalidadId, r.HorarioId, r.PeriodoId, r.AccionId, r.CoordinadorId, ct);

        if (fkErrors.Count > 0)
            throw new AppValidationException(fkErrors);

        entity.CursoId = r.CursoId;
        entity.SedeId = r.SedeId;
        entity.ModalidadId = r.ModalidadId;
        entity.HorarioId = r.HorarioId;
        entity.PeriodoId = r.PeriodoId;
        entity.AccionId = r.AccionId;
        entity.CoordinadorId = r.CoordinadorId;
        entity.Comentarios = r.Comentarios;

        await _db.SaveChangesAsync(ct);

        return new OfertaResponseDto
        {
            OfertaId = entity.OfertaId,
            CursoId = entity.CursoId,
            SedeId = entity.SedeId,
            ModalidadId = entity.ModalidadId,
            HorarioId = entity.HorarioId,
            PeriodoId = entity.PeriodoId,
            AccionId = entity.AccionId,
            CoordinadorId = entity.CoordinadorId,
            Comentarios = entity.Comentarios
        };
    }
}
