using MediatR;

namespace SIGO.Application.Features.Ofertas.Queries.Export;

public sealed record ExportOfertasPresencialVirtualExcelQuery : IRequest<byte[]>
{
    public int PeriodoId { get; init; }
}