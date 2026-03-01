using MediatR;
using SIGO.Application.Features.Horarios.Dto;

namespace SIGO.Application.Features.Horarios.Queries;

public sealed record GetHorariosQuery() : IRequest<List<HorarioResponseDto>>;
