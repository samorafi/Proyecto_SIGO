using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Periodos.Dto;
using SIGO.Application.Features.Periodos.Validation;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Periodos.Commands.Create;

public sealed class CreatePeriodoCommandHandler : IRequestHandler<CreatePeriodoCommand, PeriodoDto>
{
    private readonly IApplicationDbContext _db;
    public CreatePeriodoCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<PeriodoDto> Handle(CreatePeriodoCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var errors = await PeriodoValidatorHelper.ValidateCreateAsync(_db, r.Anio, r.Numero, r.Tipo, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        var tipoEnum =
            (r.Tipo ?? "C").Trim().ToUpperInvariant() switch
            {
                "C" => PeriodoTipo.Cuatrimestre,
                "T" => PeriodoTipo.Trimestre,
                "P" => PeriodoTipo.Mensual,
                _ => PeriodoTipo.Cuatrimestre
            };

        var e = new Periodo
        {
            Anio = r.Anio,
            Numero = r.Numero,
            Estado = r.Estado,
            Tipo = tipoEnum
        };

        _db.Periodos.Add(e);
        await _db.SaveChangesAsync(ct);

        var dto = await _db.Periodos.AsNoTracking()
            .Where(x => x.PeriodoId == e.PeriodoId)
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
