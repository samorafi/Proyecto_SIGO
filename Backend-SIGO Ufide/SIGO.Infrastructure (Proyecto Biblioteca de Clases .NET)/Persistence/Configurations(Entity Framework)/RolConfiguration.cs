using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations
{
    public class RolConfiguration : IEntityTypeConfiguration<Rol>
    {
        public void Configure(EntityTypeBuilder<Rol> builder)
        {
            builder.ToTable("rol", "universidad");

            builder.HasKey(r => r.RolId);

            builder.Property(r => r.RolId)
                   .HasColumnName("rol_id");

            builder.Property(r => r.Nombre)
                   .HasColumnName("nombre")
                   .IsRequired();

            builder.HasIndex(r => r.Nombre)
                   .IsUnique();
        }
    }
}
