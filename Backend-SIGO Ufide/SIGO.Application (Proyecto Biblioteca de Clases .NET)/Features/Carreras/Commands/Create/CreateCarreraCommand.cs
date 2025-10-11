using MediatR;
using SIGO.Application.Features.Carreras.Dto;

namespace SIGO.Application.Features.Carreras.Commands.Create;
public sealed record CreateCarreraCommand(CreateCarreraRequest Data) : IRequest<CarreraResponseDto>;
