using MediatR;
using SIGO.Application.Features.Cursos.Dto;

namespace SIGO.Application.Features.Cursos.Commands.Create;

public sealed record CreateCursoCommand(CreateCursoRequest Data) : IRequest<CursoResponseDto>;
