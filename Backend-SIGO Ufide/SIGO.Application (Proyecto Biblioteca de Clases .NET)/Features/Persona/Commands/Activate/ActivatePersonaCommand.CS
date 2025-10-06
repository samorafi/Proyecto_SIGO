using MediatR;

namespace SIGO.Application.Features.Persona.Commands.Activate
{
    // SOLAMENTE SE REQUIERE EL iD PARA ACTIVAR El docente.
    public class ActivatePersonaCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}

