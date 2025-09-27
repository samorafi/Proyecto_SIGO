using Microsoft.EntityFrameworkCore;
using SIGO.Domain.Entities;

namespace SIGO.Application.Abstractions
{
    public interface IApplicationDbContext
    {
        DbSet<Usuario> Usuarios { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
