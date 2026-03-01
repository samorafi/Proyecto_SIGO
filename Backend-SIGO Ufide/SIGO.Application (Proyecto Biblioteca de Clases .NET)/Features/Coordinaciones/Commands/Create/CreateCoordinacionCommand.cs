using MediatR;
using SIGO.Application.Features.Coordinaciones.Dto;

namespace SIGO.Application.Features.Coordinaciones.Commands.Create;

public sealed record CreateCoordinacionCommand(CreateCoordinacionRequest Data) : IRequest<CoordinacionResponseDto>;
