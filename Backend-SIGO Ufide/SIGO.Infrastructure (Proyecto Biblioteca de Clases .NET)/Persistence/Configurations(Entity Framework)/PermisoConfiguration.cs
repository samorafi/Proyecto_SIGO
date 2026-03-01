using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations
{
    public class PermisoConfiguration : IEntityTypeConfiguration<Permiso>
    {
        public void Configure(EntityTypeBuilder<Permiso> builder)
        {
            builder.ToTable("permiso", "universidad");

            builder.HasKey(p => p.PermisoId);

            builder.Property(p => p.PermisoId)
                   .HasColumnName("permiso_id");

            builder.Property(p => p.Nombre)
                   .HasColumnName("nombre")
                   .IsRequired();

            builder.Property(p => p.Clave)
                   .HasColumnName("clave")
                   .IsRequired();

            builder.HasIndex(p => p.Clave)
                   .IsUnique();

            builder.Property(p => p.Ruta)
                   .HasColumnName("ruta")
                   .IsRequired();
        }
    }
}
