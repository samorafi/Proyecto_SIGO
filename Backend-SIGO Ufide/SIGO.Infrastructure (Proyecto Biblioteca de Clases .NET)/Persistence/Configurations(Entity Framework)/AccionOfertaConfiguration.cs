using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class AccionOfertaConfiguration : IEntityTypeConfiguration<AccionOferta>
{
    public void Configure(EntityTypeBuilder<AccionOferta> b)
    {
        b.ToTable("accion_oferta", "universidad");
        b.HasKey(x => x.AccionId).HasName("pk_accion_oferta");

        b.Property(x => x.AccionId).HasColumnName("accion_id");
        b.Property(x => x.Nombre)
            .HasColumnName("nombre")
            .IsRequired();

        b.HasIndex(x => x.Nombre)
            .IsUnique()
            .HasDatabaseName("ux_accion_oferta_nombre");
    }
}
