using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Periodos.Dto;
using SIGO.Application.Features.Periodos.Validation;

namespace SIGO.Application.Features.Periodos.Commands.Update;

public sealed class UpdatePeriodoCommandHandler : IRequestHandler<UpdatePeriodoCommand, PeriodoResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public UpdatePeriodoCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<PeriodoResponseDto?> Handle(UpdatePeriodoCommand request, CancellationToken ct)
    {
        var id = request.Id;
        var r = request.Data;

        var entity = await _db.Periodos.FirstOrDefaultAsync(p => p.PeriodoId == id, ct);
        if (entity is null) return null;

        var errors = await PeriodoValidatorHelper.ValidateUpdateAsync(_db, id, r.Anio, r.Numero, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        entity.Anio = r.Anio;
        entity.Numero = r.Numero;
        entity.Estado = r.Estado;

        await _db.SaveChangesAsync(ct);

        return new PeriodoResponseDto { PeriodoId = entity.PeriodoId, Anio = entity.Anio, Numero = entity.Numero, Estado = entity.Estado };
    }
}
