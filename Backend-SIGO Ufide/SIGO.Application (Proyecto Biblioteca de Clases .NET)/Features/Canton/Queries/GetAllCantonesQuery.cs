using MediatR;
using SIGO.Application.Features.Cantones.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.Cantones.Queries.GetAll
{
    public class GetAllCantonesQuery : IRequest<IEnumerable<CantonDto>>
    {
    }
}