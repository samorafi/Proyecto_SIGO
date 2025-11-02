using MediatR;
using SIGO.Application.Features.Periodos.Dto;

namespace SIGO.Application.Features.Periodos.Queries;
public sealed record GetPeriodoByIdQuery(int Id) : IRequest<PeriodoDto?>;
