using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class CarreraConfiguration : IEntityTypeConfiguration<Carrera>
{
    public void Configure(EntityTypeBuilder<Carrera> b)
    {
        b.ToTable("carrera", "universidad");
        b.HasKey(x => x.CarreraId);

        b.Property(x => x.CarreraId).HasColumnName("carrera_id");
        b.Property(x => x.Nombre).HasColumnName("nombre").IsRequired();
        b.Property(x => x.Estado).HasColumnName("estado").HasDefaultValue(true).IsRequired();

        b.HasIndex(x => x.Nombre).IsUnique().HasDatabaseName("ux_carrera_nombre");
    }
}
