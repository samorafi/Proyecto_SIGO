using MediatR;
using SIGO.Application.Features.Provincias.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.Provincias.Queries.GetAll
{
    public class GetAllProvinciasQuery : IRequest<IEnumerable<ProvinciaDto>>
    {
    }
}