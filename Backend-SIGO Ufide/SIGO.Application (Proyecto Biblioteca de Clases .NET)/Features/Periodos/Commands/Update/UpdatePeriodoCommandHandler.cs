using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Periodos.Dto;
using SIGO.Application.Features.Periodos.Validation;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Periodos.Commands.Update;

public sealed class UpdatePeriodoCommandHandler : IRequestHandler<UpdatePeriodoCommand, PeriodoDto?>
{
    private readonly IApplicationDbContext _db;
    public UpdatePeriodoCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<PeriodoDto?> Handle(UpdatePeriodoCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var entity = await _db.Periodos.FirstOrDefaultAsync(p => p.PeriodoId == request.Id, ct);
        if (entity is null) return null;

        var newAnio = r.Anio ?? entity.Anio;
        var newNumero = r.Numero ?? entity.Numero;
        var newEstado = r.Estado ?? entity.Estado;

        var currentTipoStr =
            entity.Tipo == PeriodoTipo.Cuatrimestre ? "C" :
            entity.Tipo == PeriodoTipo.Trimestre ? "T" : "P";

        var tipoStr = (r.Tipo ?? currentTipoStr).Trim().ToUpperInvariant();

        var newTipo =
            tipoStr == "C" ? PeriodoTipo.Cuatrimestre :
            tipoStr == "T" ? PeriodoTipo.Trimestre :
                             PeriodoTipo.Mensual;

        var errors = await PeriodoValidatorHelper.ValidateUpdateAsync(
            _db, entity.PeriodoId, newAnio, newNumero, tipoStr, ct);

        if (errors.Count > 0) throw new AppValidationException(errors);

        entity.Anio = newAnio;
        entity.Numero = newNumero;
        entity.Estado = newEstado;
        entity.Tipo = newTipo;

        await _db.SaveChangesAsync(ct);

        var dto = await _db.Periodos.AsNoTracking()
            .Where(x => x.PeriodoId == entity.PeriodoId)
            .Select(x => new PeriodoDto
            {
                PeriodoId = x.PeriodoId,
                Anio = x.Anio,
                Numero = x.Numero,
                Estado = x.Estado,
                Tipo = x.Tipo == PeriodoTipo.Cuatrimestre ? "C"
                          : x.Tipo == PeriodoTipo.Trimestre ? "T"
                          : "P",
                Etiqueta = x.Etiqueta
            })
            .FirstAsync(ct);

        return dto;
    }
}
