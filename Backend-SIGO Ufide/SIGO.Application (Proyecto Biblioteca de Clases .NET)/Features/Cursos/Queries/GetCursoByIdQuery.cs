using MediatR;
using SIGO.Application.Features.Cursos.Dto;

namespace SIGO.Application.Features.Cursos.Queries;

public sealed record GetCursoByIdQuery(int Id) : IRequest<CursoResponseDto?>;
