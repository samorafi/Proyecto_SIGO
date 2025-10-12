using MediatR;
using SIGO.Application.Features.Personas.Dto;

namespace SIGO.Application.Features.Personas.Queries;

public sealed record GetCoordinadoresQuery(bool SoloActivas = true) : IRequest<List<CoordinadorResponseDto>>;
