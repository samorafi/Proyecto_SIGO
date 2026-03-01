using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Commands.ArchivarPorModalidad;

public class ArchivarOfertasPorModalidadCommand : IRequest<ArchivarOfertasPorModalidadResponseDto>
{
    public int PeriodoId { get; set; }
    public List<int> Modalidades { get; set; } = new();
}
