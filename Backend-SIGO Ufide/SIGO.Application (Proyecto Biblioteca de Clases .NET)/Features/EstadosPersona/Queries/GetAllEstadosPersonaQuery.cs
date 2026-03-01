using MediatR;
using SIGO.Application.Features.EstadosPersona.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.EstadosPersona.Queries.GetAll
{
    public class GetAllEstadosPersonaQuery : IRequest<IEnumerable<EstadoPersonaDto>>
    {
    }
}

