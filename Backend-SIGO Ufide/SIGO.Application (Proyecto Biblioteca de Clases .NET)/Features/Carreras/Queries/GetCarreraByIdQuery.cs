using MediatR;
using SIGO.Application.Features.Carreras.Dto;

namespace SIGO.Application.Features.Carreras.Queries;
public sealed record GetCarreraByIdQuery(int Id) : IRequest<CarreraResponseDto?>;
