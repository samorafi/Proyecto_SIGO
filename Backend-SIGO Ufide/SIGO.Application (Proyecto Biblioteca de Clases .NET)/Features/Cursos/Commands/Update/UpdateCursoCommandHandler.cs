using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Cursos.Dto;
using SIGO.Application.Features.Cursos.Validation;

namespace SIGO.Application.Features.Cursos.Commands.Update;

public sealed class UpdateCursoCommandHandler : IRequestHandler<UpdateCursoCommand, CursoResponseDto?>
{
    private readonly IApplicationDbContext _db;
    public UpdateCursoCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CursoResponseDto?> Handle(UpdateCursoCommand request, CancellationToken ct)
    {
        var id = request.Id;
        var r = request.Data;

        var entity = await _db.Cursos.FirstOrDefaultAsync(x => x.CursoId == id, ct);
        if (entity is null) return null; // controller devolverá 404

        var errors = await CursoValidatorHelper.ValidateUpdateAsync(_db, id, r.Codigo, r.Nombre, r.CarreraId, r.GradoId, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        entity.Codigo = r.Codigo.Trim();
        entity.Nombre = r.Nombre.Trim();
        entity.CarreraId = r.CarreraId;
        entity.GradoId = r.GradoId;
        entity.EsNetcad = r.EsNetcad;
        entity.Estado = r.Estado;

        await _db.SaveChangesAsync(ct);

        return new CursoResponseDto
        {
            CursoId = entity.CursoId,
            Codigo = entity.Codigo,
            Nombre = entity.Nombre,
            CarreraId = entity.CarreraId,
            GradoId = entity.GradoId,
            EsNetcad = entity.EsNetcad,
            Estado = entity.Estado
        };
    }
}
