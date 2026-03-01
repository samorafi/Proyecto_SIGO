using MediatR;
using SIGO.Application.Features.Modalidades.Dto;

namespace SIGO.Application.Features.Modalidades.Queries;

public sealed record GetModalidadesQuery() : IRequest<List<ModalidadResponseDto>>;
