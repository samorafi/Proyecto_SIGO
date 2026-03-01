using MediatR;
using SIGO.Application.Features.Carreras.Dto;

namespace SIGO.Application.Features.Carreras.Commands.Update;
public sealed record UpdateCarreraCommand(int Id, UpdateCarreraRequest Data) : IRequest<CarreraResponseDto?>;
