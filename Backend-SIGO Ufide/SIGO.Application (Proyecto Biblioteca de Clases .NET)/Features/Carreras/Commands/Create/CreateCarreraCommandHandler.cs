using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Carreras.Dto;
using SIGO.Application.Features.Carreras.Validation;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Carreras.Commands.Create;

public sealed class CreateCarreraCommandHandler : IRequestHandler<CreateCarreraCommand, CarreraResponseDto>
{
    private readonly IApplicationDbContext _db;
    public CreateCarreraCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CarreraResponseDto> Handle(CreateCarreraCommand request, CancellationToken ct)
    {
        var r = request.Data;
        var errors = await CarreraValidatorHelper.ValidateCreateAsync(_db, r.Nombre, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        var e = new Carrera { Nombre = r.Nombre.Trim(), Estado = r.Estado };
        _db.Carreras.Add(e);
        await _db.SaveChangesAsync(ct);

        return new CarreraResponseDto { CarreraId = e.CarreraId, Nombre = e.Nombre, Estado = e.Estado };
    }
}
