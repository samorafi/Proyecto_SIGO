using MediatR;
using SIGO.Application.Features.Cursos.Dto;

namespace SIGO.Application.Features.Cursos.Commands.Update;

public sealed record UpdateCursoCommand(int Id, UpdateCursoRequest Data) : IRequest<CursoResponseDto?>;
