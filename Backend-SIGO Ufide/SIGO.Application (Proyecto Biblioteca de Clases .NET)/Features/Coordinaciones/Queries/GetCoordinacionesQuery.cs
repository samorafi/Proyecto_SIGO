using MediatR;
using SIGO.Application.Features.Coordinaciones.Dto;

namespace SIGO.Application.Features.Coordinaciones.Queries;
public sealed record GetCoordinacionesQuery() : IRequest<List<CoordinacionResponseDto>>;
