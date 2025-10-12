using MediatR;
using SIGO.Application.Features.Periodos.Dto;

namespace SIGO.Application.Features.Periodos.Commands.Update;
public sealed record UpdatePeriodoCommand(int Id, UpdatePeriodoRequest Data) : IRequest<PeriodoResponseDto?>;
