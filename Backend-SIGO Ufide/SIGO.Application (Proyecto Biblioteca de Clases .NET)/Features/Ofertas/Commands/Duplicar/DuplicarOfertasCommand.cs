using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Commands.Duplicar;

public class DuplicarOfertasCommand : IRequest<DuplicarOfertasResponseDto>
{
    public int PeriodoOrigen { get; set; }
    public int PeriodoDestino { get; set; }
    public List<int> Modalidades { get; set; } = new();
}
