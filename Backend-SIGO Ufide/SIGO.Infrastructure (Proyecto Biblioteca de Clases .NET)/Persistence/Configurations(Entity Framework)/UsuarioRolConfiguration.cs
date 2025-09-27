using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations
{
    public class UsuarioRolConfiguration : IEntityTypeConfiguration<UsuarioRol>
    {
        public void Configure(EntityTypeBuilder<UsuarioRol> builder)
        {
            builder.ToTable("usuario_rol", "public");

            builder.HasKey(ur => new { ur.UsuarioId, ur.RolId });

            builder.Property(ur => ur.UsuarioId)
                   .HasColumnName("usuario_id");

            builder.Property(ur => ur.RolId)
                   .HasColumnName("rol_id");

           // builder.HasOne(ur => ur.Usuario)
           //        .WithMany(u => u.UsuarioRoles)
           //        .HasForeignKey(ur => ur.UsuarioId);

            builder.HasOne(ur => ur.Rol)
                   .WithMany(r => r.UsuarioRoles)
                   .HasForeignKey(ur => ur.RolId);
        }
    }
}
