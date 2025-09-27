using Microsoft.EntityFrameworkCore;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence
{
    public class SigoDbContext : DbContext
    {
        public SigoDbContext(DbContextOptions<SigoDbContext> options) : base(options) { }


        public DbSet<Provincia> Provincias { get; set; } 


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

        }
    }
}
