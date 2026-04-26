using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations
{
    public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
    {
        public void Configure(EntityTypeBuilder<Usuario> builder)
        {
            // Nombre de la tabla y esquema correcto
            builder.ToTable("usuario", schema: "universidad");

            builder.HasKey(u => u.UsuarioId);

            builder.Property(u => u.UsuarioId)
                .HasColumnName("usuario_id");

            builder.Property(u => u.Nombre)
                .HasColumnName("nombre")
                .IsRequired();

            builder.Property(u => u.Correo)
                .HasColumnName("correo")
                .IsRequired();

            builder.Property(u => u.PasswordHash)
                .HasColumnName("contrasena")
                .IsRequired();

            builder.Property(u => u.Activo)
                .HasColumnName("activo")
                .HasDefaultValue(true);

            builder.Property(u => u.AccessFailedCount)
                .HasColumnName("AccessFailedCount")
                .HasDefaultValue(0);

            builder.Property(u => u.LockoutEnd)
                .HasColumnName("LockoutEnd");

            builder.Property(u => u.LockoutEnabled)
                .HasColumnName("LockoutEnabled")
                .HasDefaultValue(true);
        }
    }
}
