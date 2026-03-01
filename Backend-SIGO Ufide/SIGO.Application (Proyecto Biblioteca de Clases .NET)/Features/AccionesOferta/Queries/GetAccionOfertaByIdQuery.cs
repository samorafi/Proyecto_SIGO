using MediatR;
using SIGO.Application.Features.AccionesOferta.Dto;

namespace SIGO.Application.Features.AccionesOferta.Queries;

public sealed record GetAccionOfertaByIdQuery(int Id) : IRequest<AccionOfertaResponseDto?>;
