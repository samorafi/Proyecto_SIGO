using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Cursos.Dto;
using SIGO.Application.Features.Cursos.Validation;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Cursos.Commands.Create;

public sealed class CreateCursoCommandHandler : IRequestHandler<CreateCursoCommand, CursoResponseDto>
{
    private readonly IApplicationDbContext _db;
    public CreateCursoCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CursoResponseDto> Handle(CreateCursoCommand request, CancellationToken ct)
    {
        var r = request.Data;

        var errors = await CursoValidatorHelper.ValidateCreateAsync(_db, r.Codigo, r.Nombre, r.CarreraId, r.GradoId, ct);
        if (errors.Count > 0) throw new AppValidationException(errors);

        var e = new Curso
        {
            Codigo = r.Codigo.Trim(),
            Nombre = r.Nombre.Trim(),
            CarreraId = r.CarreraId,
            GradoId = r.GradoId,
            EsNetcad = r.EsNetcad,
            Estado = r.Estado
        };

        _db.Cursos.Add(e);
        await _db.SaveChangesAsync(ct);

        return new CursoResponseDto
        {
            CursoId = e.CursoId,
            Codigo = e.Codigo,
            Nombre = e.Nombre,
            CarreraId = e.CarreraId,
            GradoId = e.GradoId,
            EsNetcad = e.EsNetcad,
            Estado = e.Estado
        };
    }
}
