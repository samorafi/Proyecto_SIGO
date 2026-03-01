using MediatR;
using SIGO.Application.Features.Coordinaciones.Dto;

namespace SIGO.Application.Features.Coordinaciones.Queries;
public sealed record GetCoordinacionByIdQuery(int Id) : IRequest<CoordinacionResponseDto?>;
