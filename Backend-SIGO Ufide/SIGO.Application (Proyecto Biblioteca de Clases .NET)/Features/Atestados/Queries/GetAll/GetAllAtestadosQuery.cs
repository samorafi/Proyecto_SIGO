using MediatR;
using SIGO.Application.Features.Atestados.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.Atestados.Queries.GetAll
{
    public class GetAllAtestadosQuery : IRequest<IEnumerable<AtestadoDto>>
    {
    }
}
