using MediatR;
using SIGO.Application.Features.Periodos.Dto;

namespace SIGO.Application.Features.Periodos.Commands.Create;
public sealed record CreatePeriodoCommand(CreatePeriodoRequest Data) : IRequest<PeriodoResponseDto>;
