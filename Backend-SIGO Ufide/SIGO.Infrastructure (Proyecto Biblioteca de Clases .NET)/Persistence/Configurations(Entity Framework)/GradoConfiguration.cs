using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations.Universidad;

public class GradoConfiguration : IEntityTypeConfiguration<Grado>
{
    public void Configure(EntityTypeBuilder<Grado> b)
    {
        b.ToTable("grado", "universidad");
        b.HasKey(x => x.GradoId).HasName("pk_grado");

        b.Property(x => x.GradoId).HasColumnName("grado_id");
        b.Property(x => x.Nombre).HasColumnName("nombre").IsRequired();

        b.HasIndex(x => x.Nombre).IsUnique().HasDatabaseName("ux_grado_nombre");
    }
}
