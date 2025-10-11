using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class ModalidadConfiguration : IEntityTypeConfiguration<Modalidad>
{
    public void Configure(EntityTypeBuilder<Modalidad> b)
    {
        b.ToTable("modalidad", "universidad");
        b.HasKey(x => x.ModalidadId).HasName("pk_modalidad");

        b.Property(x => x.ModalidadId).HasColumnName("modalidad_id");
        b.Property(x => x.Nombre)
            .HasColumnName("nombre")
            .IsRequired();

        b.HasIndex(x => x.Nombre)
            .IsUnique()
            .HasDatabaseName("ux_modalidad_nombre");
    }
}
