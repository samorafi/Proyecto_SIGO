using MediatR;
using SIGO.Application.Features.Grados.Dto;

namespace SIGO.Application.Features.Grados.Queries;

public sealed record GetGradoByIdQuery(int Id) : IRequest<GradoResponseDto?>;
