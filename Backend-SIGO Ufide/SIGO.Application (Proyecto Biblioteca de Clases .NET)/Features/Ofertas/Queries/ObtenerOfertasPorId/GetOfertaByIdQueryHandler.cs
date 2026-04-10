using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Exceptions;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Queries.ObtenerOfertasPorId;

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
                Cursoid = o.Curso != null ? o.Curso.Codigo : null,
                Curso = o.Curso != null ? o.Curso.Nombre : null,
                Sede = o.Sede != null ? o.Sede.Nombre : null,
                Modalidad = o.Modalidad != null ? o.Modalidad.Nombre : null,

                HorarioId = o.HorarioId,
                HorarioDia = o.Horario != null && !string.IsNullOrEmpty(o.Horario.Dia)
                    ? o.Horario.Dia.Substring(0, 1)
                    : null,
                HorarioHora = o.Horario != null ? o.Horario.Rango : null,

                PeriodoId = o.PeriodoId,
                Periodo = o.Periodo != null ? o.Periodo.Etiqueta : null,

                Accion = o.Accion != null ? o.Accion.Nombre : null,
                AccionId = o.AccionId,

                CoordinadorId = o.CoordinadorId,
                Coordinador = o.Coordinador != null
                    ? ((o.Coordinador.Nombre ?? "") + " " +
                       (o.Coordinador.PrimerApellido ?? "") + " " +
                       (o.Coordinador.SegundoApellido ?? "")).Trim()
                    : null,

                Comentarios = o.Comentarios,
                Estado = o.EstadoOferta != null ? o.EstadoOferta.Nombre : null,
                Grupo = o.Grupo,
                Cupo = o.Cupo,
                Matriculados = o.Matriculados,
                Archivados = o.Archivados,

                PersonaId = o.PersonaId,
                Persona = o.Persona != null
                    ? ((o.Persona.Nombre ?? "") + " " +
                       (o.Persona.PrimerApellido ?? "") + " " +
                       (o.Persona.SegundoApellido ?? "")).Trim()
                    : null
            })
            .FirstOrDefaultAsync(ct);

        if (dto is null)
            throw new NotFoundException("Oferta", request.OfertaId);

        dto.Asistentes = await _db.OfertaAsistentes
            .AsNoTracking()
            .Where(a => a.OfertaId == request.OfertaId)
            .Join(
                _db.Personas.AsNoTracking(),
                a => a.PersonaId,
                p => p.Id,
                (a, p) => new OfertaAsistenteDto
                {
                    PersonaId = p.Id,
                    NombreCompleto = ((p.Nombre ?? "") + " " +
                                      (p.PrimerApellido ?? "") + " " +
                                      (p.SegundoApellido ?? "")).Trim(),
                    Correo = p.Correo
                })
            .OrderBy(a => a.NombreCompleto)
            .ToListAsync(ct);

        return dto;
    }
}