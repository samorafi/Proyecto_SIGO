using MediatR;
using SIGO.Application.Features.Periodos.Dto;
using System.Collections.Generic;

namespace SIGO.Application.Features.Periodos.Queries;

public sealed record GetPeriodosQuery(bool? Estado = null) : IRequest<List<PeriodoDto>>;
