using MediatR;
using SIGO.Application.Features.TiposContrato.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.TiposContrato.Queries.GetAll
{
    public class GetAllTiposContratoQuery : IRequest<IEnumerable<TipoContratoDto>>
    {
    }
}
