using MediatR;
using SIGO.Application.Features.Personas.Dto;

namespace SIGO.Application.Features.Persona.Queries.GetById
{
    public class GetPersonaByIdQuery : IRequest<PersonaDto?>
    {
        public int Id { get; set; }
    }
}
