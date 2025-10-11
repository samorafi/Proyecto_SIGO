using MediatR;
using SIGO.Application.Features.Cursos.Dto;
using System.Collections.Generic;

namespace SIGO.Application.Features.Cursos.Queries;

public sealed record GetCursosQuery(bool? Estado = null) : IRequest<List<CursoResponseDto>>;
