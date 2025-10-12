using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class PeriodoConfiguration : IEntityTypeConfiguration<Periodo>
{
    public void Configure(EntityTypeBuilder<Periodo> b)
    {
        b.ToTable("periodo", "universidad");
        b.HasKey(x => x.PeriodoId);

        b.Property(x => x.PeriodoId).HasColumnName("periodo_id");
        b.Property(x => x.Anio).HasColumnName("anio").IsRequired();
        b.Property(x => x.Numero).HasColumnName("numero").IsRequired();
        b.Property(x => x.Estado).HasColumnName("estado").HasDefaultValue(true).IsRequired();

        b.HasIndex(x => new { x.Anio, x.Numero })
         .IsUnique()
         .HasDatabaseName("ux_periodo_anio_numero");
    }
}
