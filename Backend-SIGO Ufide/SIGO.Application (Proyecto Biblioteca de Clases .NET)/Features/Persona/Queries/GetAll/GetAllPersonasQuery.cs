using MediatR;
using SIGO.Application.Features.Persona.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.Persona.Queries.GetAll
{
    public class GetAllPersonasQuery : IRequest<IEnumerable<PersonaDto>>
    {
    }
}