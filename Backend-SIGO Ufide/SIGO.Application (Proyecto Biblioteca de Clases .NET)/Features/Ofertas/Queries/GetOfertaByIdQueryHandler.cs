using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Common.Exceptions;

namespace SIGO.Application.Features.Ofertas.Queries;

public class GetOfertaByIdQueryHandler : IRequestHandler<GetOfertaByIdQuery, OfertaResponseDto>
{
    private readonly IApplicationDbContext _db;
    public GetOfertaByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<OfertaResponseDto> Handle(GetOfertaByIdQuery request, CancellationToken ct)
    {
        var dto = await _db.Ofertas
            .AsNoTracking()
            .Where(x => x.OfertaId == request.OfertaId)
            .Select(o => new OfertaResponseDto
            {
                OfertaId = o.OfertaId,
                Curso = o.Curso != null ? o.Curso.Codigo : null,
                Sede = o.Sede != null ? o.Sede.Nombre : null,
                Modalidad = o.Modalidad != null ? o.Modalidad.Nombre : null,
                HorarioId = o.HorarioId,
                Periodo = o.Periodo != null ? o.Periodo.Etiqueta : null,
                Accion = o.Accion != null ? o.Accion.Nombre : null,
                CoordinadorId = o.CoordinadorId,
                Comentarios = o.Comentarios,
                Estado = o.EstadoOferta != null ? o.EstadoOferta.Nombre : null
            })
            .FirstOrDefaultAsync(ct);

        if (dto is null) throw new NotFoundException("Oferta", request.OfertaId);
        return dto;
    }
}
