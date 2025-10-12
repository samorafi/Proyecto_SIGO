using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Periodos.Dto;
using SIGO.Application.Features.Periodos.Validation;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Periodos.Commands.Create;

public sealed class CreatePeriodoCommandHandler : IRequestHandler<CreatePeriodoCommand, PeriodoResponseDto>
{
    private readonly IApplicationDbContext _db;
    public CreatePeriodoCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<PeriodoResponseDto> Handle(CreatePeriodoCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var errors = await PeriodoValidatorHelper.ValidateCreateAsync(_db, r.Anio, r.Numero, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        var e = new Periodo { Anio = r.Anio, Numero = r.Numero, Estado = r.Estado };
        _db.Periodos.Add(e);
        await _db.SaveChangesAsync(ct);

        return new PeriodoResponseDto { PeriodoId = e.PeriodoId, Anio = e.Anio, Numero = e.Numero, Estado = e.Estado };
    }
}
