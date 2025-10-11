using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class HorarioConfiguration : IEntityTypeConfiguration<Horario>
{
    public void Configure(EntityTypeBuilder<Horario> b)
    {
        b.ToTable("horario", "universidad");
        b.HasKey(x => x.HorarioId).HasName("pk_horario");

        b.Property(x => x.HorarioId).HasColumnName("horario_id");
        b.Property(x => x.Dia)
            .HasColumnName("dia")
            .IsRequired();
        b.Property(x => x.Rango)
            .HasColumnName("rango")
            .IsRequired();
        b.HasIndex(x => new { x.Dia, x.Rango })
            .IsUnique()
            .HasDatabaseName("ux_horario_dia_rango");

    }
}
