using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations_Entity_Framework_;

public class PeriodoConfiguration : IEntityTypeConfiguration<Periodo>
{
    public void Configure(EntityTypeBuilder<Periodo> builder)
    {
        builder.ToTable("periodo", "universidad");
        builder.HasKey(p => p.PeriodoId);
        builder.Property(p => p.PeriodoId).HasColumnName("periodo_id");
        builder.Property(p => p.Anio).HasColumnName("anio");
        builder.Property(p => p.Numero).HasColumnName("numero");
    }
}
