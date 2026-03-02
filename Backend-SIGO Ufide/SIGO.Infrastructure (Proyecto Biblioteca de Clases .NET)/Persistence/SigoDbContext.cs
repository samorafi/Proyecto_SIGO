using Microsoft.EntityFrameworkCore;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence
{
    public class SigoDbContext : DbContext
    {
        public SigoDbContext(DbContextOptions<SigoDbContext> options) : base(options) { }
        public DbSet<Provincia> Provincias { get; set; }
        public DbSet<PasswordResetOtp> PasswordResetOtps => Set<PasswordResetOtp>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
        public DbSet<Usuario> Usuarios { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(SigoDbContext).Assembly);

        }
    }
}
