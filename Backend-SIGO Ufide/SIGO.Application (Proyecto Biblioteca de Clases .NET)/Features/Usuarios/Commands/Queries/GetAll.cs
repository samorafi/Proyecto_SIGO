using MediatR;
using SIGO.Domain.Entities;
using System.Collections.Generic;

namespace SIGO.Application.Features.Usuarios.Queries.GetAll
{
    // Devuelve la lista de los usuarios
    public class GetUsuariosQuery : IRequest<List<Usuario>> { }
}
