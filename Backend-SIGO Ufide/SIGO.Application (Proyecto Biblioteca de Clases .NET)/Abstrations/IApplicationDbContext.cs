using Microsoft.EntityFrameworkCore;
using SIGO.Domain.Entities;
using System.Collections.Generic;

namespace SIGO.Application.Abstractions
{
    public interface IApplicationDbContext
    {
        DbSet<Usuario> Usuarios { get; }
        DbSet<Rol> Roles { get; }
        DbSet<Permiso> Permisos { get; }
        DbSet<UsuarioRol> UsuarioRoles { get; }
        DbSet<RolPermiso> RolPermisos { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
