using MediatR;

namespace SIGO.Application.Features.Persona.Commands.Activate
{
    public class ActivatePersonaCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}

