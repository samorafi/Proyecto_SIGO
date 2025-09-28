using MediatR;
using SIGO.Domain.Entities;
using System.Collections.Generic;
using SIGO.Application.Features.Usuarios.Dto;

namespace SIGO.Application.Features.Usuarios.Queries.GetId
{
    // Request para login: Correo y contraseña
    public class PostUsuarioLoginQuery : IRequest<UsuarioDto?>
    {
        public string Correo { get; }
        public string Contrasena { get; }

        public PostUsuarioLoginQuery(string correo, string contrasena)
        {
            Correo = correo;
            Contrasena = contrasena;
        }
    }
}
