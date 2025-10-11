using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Ofertas.Commands.Create;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Validation;
using SIGO.Domain.Entities;

public sealed class CreateOfertaCommandHandler : IRequestHandler<CreateOfertaCommand, OfertaResponseDto>
{
    private readonly IApplicationDbContext _db;
    public CreateOfertaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<OfertaResponseDto> Handle(CreateOfertaCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var fkErrors = await OfertaFkValidator.ValidateCreateAsync(
            _db, r.CursoId, r.SedeId, r.ModalidadId, r.HorarioId, r.PeriodoId, r.AccionId, r.CoordinadorId, ct);

        if (fkErrors.Count > 0)
            throw new AppValidationException(fkErrors);

        var e = new Oferta
        {
            CursoId = r.CursoId,
            SedeId = r.SedeId,
            ModalidadId = r.ModalidadId,
            HorarioId = r.HorarioId,
            PeriodoId = r.PeriodoId,
            AccionId = r.AccionId,
            CoordinadorId = r.CoordinadorId,
            Comentarios = r.Comentarios
        };

        _db.Ofertas.Add(e);
        await _db.SaveChangesAsync(ct);

        return new OfertaResponseDto
        {
            OfertaId = e.OfertaId,
            CursoId = e.CursoId,
            SedeId = e.SedeId,
            ModalidadId = e.ModalidadId,
            HorarioId = e.HorarioId,
            PeriodoId = e.PeriodoId,
            AccionId = e.AccionId,
            CoordinadorId = e.CoordinadorId,
            Comentarios = e.Comentarios
        };
    }
}
