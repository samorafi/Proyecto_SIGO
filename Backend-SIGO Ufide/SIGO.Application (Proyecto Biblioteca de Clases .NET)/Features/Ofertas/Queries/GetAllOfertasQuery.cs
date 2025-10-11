using MediatR;
using SIGO.Application.Features.Ofertas.Dto;
using System.Collections.Generic;

namespace SIGO.Application.Features.Ofertas.Queries;

public sealed record GetAllOfertasQuery() : IRequest<List<OfertaResponseDto>>;
