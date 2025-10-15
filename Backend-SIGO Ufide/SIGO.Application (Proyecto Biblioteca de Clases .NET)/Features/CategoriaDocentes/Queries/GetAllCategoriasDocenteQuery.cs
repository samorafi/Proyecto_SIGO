using MediatR;
using SIGO.Application.Features.CategoriaDocentes.DTO;
using System.Collections.Generic;

namespace SIGO.Application.Features.CategoriaDocentes.Queries.GetAll
{
    public class GetAllCategoriasDocenteQuery : IRequest<IEnumerable<CategoriaDocenteDto>>
    {
    }
}
