using MediatR;
using SIGO.Application.Features.MotivosDesvinculacion.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.MotivosDesvinculacion.Queries.GetAll
{
    public class GetAllMotivosDesvinculacionQuery : IRequest<IEnumerable<MotivoDesvinculacionDto>>
    {
    }
}
