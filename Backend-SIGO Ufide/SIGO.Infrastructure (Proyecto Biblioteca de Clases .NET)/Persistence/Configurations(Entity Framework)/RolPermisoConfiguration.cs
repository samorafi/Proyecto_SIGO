using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations
{
    public class RolPermisoConfiguration : IEntityTypeConfiguration<RolPermiso>
    {
        public void Configure(EntityTypeBuilder<RolPermiso> builder)
        {
            builder.ToTable("rol_permiso", "public");

            builder.HasKey(rp => new { rp.RolId, rp.PermisoId });

            builder.Property(rp => rp.RolId)
                   .HasColumnName("rol_id");

            builder.Property(rp => rp.PermisoId)
                   .HasColumnName("permiso_id");

            builder.HasOne(rp => rp.Rol)
                   .WithMany(r => r.RolPermisos)
                   .HasForeignKey(rp => rp.RolId);

            builder.HasOne(rp => rp.Permiso)
                   .WithMany(p => p.RolPermisos)
                   .HasForeignKey(rp => rp.PermisoId);
        }
    }
}
