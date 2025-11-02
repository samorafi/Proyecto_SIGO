using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SIGO.Domain.Entities;

public class PeriodoConfiguration : IEntityTypeConfiguration<Periodo>
{
    public void Configure(EntityTypeBuilder<Periodo> builder)
    {
        builder.ToTable("periodo", "universidad");

        builder.HasKey(p => p.PeriodoId).HasName("pk_periodo");

        builder.Property(p => p.PeriodoId).HasColumnName("periodo_id");
        builder.Property(p => p.Anio).HasColumnName("anio").IsRequired();
        builder.Property(p => p.Numero).HasColumnName("numero").IsRequired();
        builder.Property(p => p.Estado).HasColumnName("estado").IsRequired();

        var tipoConv = new ValueConverter<PeriodoTipo, string>(
            v => v == PeriodoTipo.Cuatrimestre ? "C"
               : v == PeriodoTipo.Trimestre ? "T"
               : "P",
            v => v == "C" ? PeriodoTipo.Cuatrimestre
               : v == "T" ? PeriodoTipo.Trimestre
               : PeriodoTipo.Mensual
        );

        builder.Property(p => p.Tipo)
            .HasColumnName("tipo")
            .HasMaxLength(1)
            .HasConversion(tipoConv)
            .IsRequired();

        builder.Property(p => p.Etiqueta)
            .HasColumnName("etiqueta")
            .ValueGeneratedOnAddOrUpdate()
            .Metadata.SetAfterSaveBehavior(
                Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore
            );

        builder.HasIndex(p => new { p.Anio, p.Tipo, p.Numero })
               .IsUnique()
               .HasDatabaseName("ux_periodo_anio_tipo_numero");

        builder.HasCheckConstraint("ck_periodo_rangos_por_tipo",
            "(tipo = 'C' AND numero BETWEEN 1 AND 3) OR " +
            "(tipo = 'T' AND numero BETWEEN 1 AND 4) OR " +
            "(tipo = 'P' AND numero BETWEEN 1 AND 12)");
    }
}
