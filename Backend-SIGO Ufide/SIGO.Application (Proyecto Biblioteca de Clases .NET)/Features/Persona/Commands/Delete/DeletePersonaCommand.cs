using MediatR;

namespace SIGO.Application.Features.Persona.Commands.Delete
{
    public class DeletePersonaCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}
