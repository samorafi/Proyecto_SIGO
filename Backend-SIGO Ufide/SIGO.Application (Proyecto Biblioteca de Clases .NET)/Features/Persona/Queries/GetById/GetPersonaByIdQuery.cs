using MediatR;
using SIGO.Application.Features.Persona.DTO;

namespace SIGO.Application.Features.Persona.Queries.GetById
{
    public class GetPersonaByIdQuery : IRequest<PersonaDto?>
    {
        public int Id { get; set; }
    }
}