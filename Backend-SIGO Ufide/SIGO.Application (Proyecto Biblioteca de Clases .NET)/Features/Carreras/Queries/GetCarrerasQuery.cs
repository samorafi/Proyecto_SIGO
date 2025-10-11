using MediatR;
using SIGO.Application.Features.Carreras.Dto;
using System.Collections.Generic;

namespace SIGO.Application.Features.Carreras.Queries;
public sealed record GetCarrerasQuery(bool? Estado = null) : IRequest<List<CarreraResponseDto>>;
