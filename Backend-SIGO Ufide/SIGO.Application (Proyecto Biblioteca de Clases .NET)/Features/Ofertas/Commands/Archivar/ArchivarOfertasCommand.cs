using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Commands.Archivar
{
    public class ArchivarOfertasCommand : IRequest<ArchivarOfertasResponseDto>
    {
        public int PeriodoId { get; set; }
    }
}
