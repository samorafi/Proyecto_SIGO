using Microsoft.EntityFrameworkCore;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence
{
    public class SigoDbContext : DbContext
    {
        public SigoDbContext(DbContextOptions<SigoDbContext> options) : base(options) { }


        public DbSet<Provincia> Provincias { get; set; }

        public DbSet<Rol> Roles { get; set; }
        public DbSet<Permiso> Permisos { get; set; }
        public DbSet<UsuarioRol> UsuarioRoles { get; set; }
        public DbSet<RolPermiso> RolPermisos { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(SigoDbContext).Assembly);

        }
    }
}
