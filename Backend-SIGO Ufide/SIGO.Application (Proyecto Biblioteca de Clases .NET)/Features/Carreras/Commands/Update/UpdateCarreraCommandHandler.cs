using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Carreras.Dto;
using SIGO.Application.Features.Carreras.Validation;

namespace SIGO.Application.Features.Carreras.Commands.Update;

public sealed class UpdateCarreraCommandHandler : IRequestHandler<UpdateCarreraCommand, CarreraResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public UpdateCarreraCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CarreraResponseDto?> Handle(UpdateCarreraCommand request, CancellationToken ct)
    {
        var id = request.Id;
        var r = request.Data;

        var entity = await _db.Carreras.FirstOrDefaultAsync(x => x.CarreraId == id, ct);
        if (entity is null) return null;

        var errors = await CarreraValidatorHelper.ValidateUpdateAsync(_db, id, r.Nombre, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        entity.Nombre = r.Nombre.Trim();
        entity.Estado = r.Estado;

        await _db.SaveChangesAsync(ct);

        return new CarreraResponseDto { CarreraId = entity.CarreraId, Nombre = entity.Nombre, Estado = entity.Estado };
    }
}
