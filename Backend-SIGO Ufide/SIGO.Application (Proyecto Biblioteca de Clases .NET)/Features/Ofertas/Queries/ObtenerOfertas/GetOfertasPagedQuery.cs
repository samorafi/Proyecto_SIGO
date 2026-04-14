using MediatR;
using SIGO.Application.Common.Pagination;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Application.Features.Ofertas.Enums;

namespace SIGO.Application.Features.Ofertas.Queries.ObtenerOfertas;

public sealed record GetOfertasPagedQuery(
    OfertaCategory Category,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<OfertaResponseDto>>
{
    public string? Buscar { get; init; }
    public int? SedeId { get; init; }
    public int? ModalidadId { get; init; }
    public int? PeriodoId { get; init; }
    public string? Dia { get; init; }
    public int? HorarioId { get; init; }
    public int? AccionId { get; init; }
    public int? EstadoOfertaId { get; init; }
}