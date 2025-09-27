using Microsoft.EntityFrameworkCore;
using SIGO.Domain.Entities;
using System.Collections.Generic;

namespace SIGO.Application.Abstractions
{
    public interface IApplicationDbContext
    {
        DbSet<Usuario> Usuarios { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
