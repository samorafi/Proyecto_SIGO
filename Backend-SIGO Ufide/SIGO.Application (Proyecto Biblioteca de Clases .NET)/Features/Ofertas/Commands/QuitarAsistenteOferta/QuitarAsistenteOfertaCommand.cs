using MediatR;

namespace SIGO.Application.Features.Ofertas.Commands.QuitarAsistenteOferta
{
    public class QuitarAsistenteOfertaCommand : IRequest
    {
        public int OfertaId { get; set; }
        public int PersonaId { get; set; }
    }
}