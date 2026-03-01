using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations_Entity_Framework_
{
    public class ProvinciaConfiguration : IEntityTypeConfiguration<Provincia>
    {
        public void Configure(EntityTypeBuilder<Provincia> builder)
        {
            builder.ToTable("provincia", "universidad");
            builder.HasKey(p => p.ProvinciaId);
            builder.Property(p => p.ProvinciaId).HasColumnName("provincia_id");
            builder.Property(p => p.Nombre).HasColumnName("nombre");

            // Relación: Una Provincia tiene muchos Cantones
            builder.HasMany(p => p.Cantones)
                   .WithOne(c => c.Provincia)
                   .HasForeignKey(c => c.ProvinciaId);
        }
    }
}
