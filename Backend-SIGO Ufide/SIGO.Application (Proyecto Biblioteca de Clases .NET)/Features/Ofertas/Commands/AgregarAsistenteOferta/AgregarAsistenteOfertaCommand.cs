using MediatR;

namespace SIGO.Application.Features.Ofertas.Commands.AgregarAsistenteOferta
{
    public class AgregarAsistenteOfertaCommand : IRequest
    {
        public int OfertaId { get; set; }
        public int PersonaId { get; set; }
    }
}