using MediatR;
using SIGO.Application.Features.Sedes.Dto;

namespace SIGO.Application.Features.Sedes.Queries;

public sealed record GetSedeByIdQuery(int Id) : IRequest<SedeResponseDto?>;
