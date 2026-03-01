using MediatR;
using SIGO.Domain.Entities;
using System.Collections.Generic;

namespace SIGO.Application.Features.Usuarios.Queries.GetAll
{
    // Query: no necesita parámetros, devuelve lista de usuarios
    public class GetUsuariosQuery : IRequest<List<Usuario>> { }
}
