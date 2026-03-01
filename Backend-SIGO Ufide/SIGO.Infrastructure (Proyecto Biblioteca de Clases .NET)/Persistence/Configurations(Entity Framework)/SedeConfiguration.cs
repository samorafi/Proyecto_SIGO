using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class SedeConfiguration : IEntityTypeConfiguration<Sede>
{
    public void Configure(EntityTypeBuilder<Sede> b)
    {
        b.ToTable("sede", "universidad");
        b.HasKey(x => x.SedeId).HasName("pk_sede");

        b.Property(x => x.SedeId).HasColumnName("sede_id");
        b.Property(x => x.Nombre)
            .HasColumnName("nombre")
            .IsRequired();

        b.HasIndex(x => x.Nombre)
            .IsUnique()
            .HasDatabaseName("ux_sede_nombre");
    }
}
