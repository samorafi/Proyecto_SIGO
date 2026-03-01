using MediatR;
using SIGO.Application.Features.Generos.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.Generos.Queries.GetAll
{
    public class GetAllGenerosQuery : IRequest<IEnumerable<GeneroDto>>
    {
    }
}
