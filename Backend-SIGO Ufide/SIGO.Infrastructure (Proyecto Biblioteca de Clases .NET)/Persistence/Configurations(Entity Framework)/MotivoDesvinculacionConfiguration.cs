using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations_Entity_Framework_;

public class MotivoDesvinculacionConfiguration : IEntityTypeConfiguration<MotivoDesvinculacion>
{
    public void Configure(EntityTypeBuilder<MotivoDesvinculacion> builder)
    {
        builder.ToTable("motivo_desvinculacion", "universidad");
        builder.HasKey(m => m.MotivoDesvinculacionId);
        builder.Property(m => m.MotivoDesvinculacionId).HasColumnName("motivo_id");
        builder.Property(m => m.Nombre).HasColumnName("nombre");
    }
}

