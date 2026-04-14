using MediatR;

namespace SIGO.Application.Features.Ofertas.Queries.Export;

public sealed record ExportOfertasEnLineaExcelQuery : IRequest<byte[]>
{
    public int PeriodoId { get; init; }
}