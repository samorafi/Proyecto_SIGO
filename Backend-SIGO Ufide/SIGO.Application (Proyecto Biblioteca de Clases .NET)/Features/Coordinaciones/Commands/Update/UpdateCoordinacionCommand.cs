using MediatR;
using SIGO.Application.Features.Coordinaciones.Dto;

namespace SIGO.Application.Features.Coordinaciones.Commands.Update;

public sealed record UpdateCoordinacionCommand(int Id, UpdateCoordinacionRequest Data) : IRequest<CoordinacionResponseDto?>;
