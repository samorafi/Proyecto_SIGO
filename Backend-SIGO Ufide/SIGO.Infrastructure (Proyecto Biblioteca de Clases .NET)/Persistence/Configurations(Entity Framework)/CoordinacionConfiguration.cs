using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class CoordinacionConfiguration : IEntityTypeConfiguration<Coordinacion>
{
    public void Configure(EntityTypeBuilder<Coordinacion> b)
    {
        b.ToTable("coordinacion", "universidad");
        b.HasKey(x => x.CoordinacionId);

        b.Property(x => x.CoordinacionId).HasColumnName("coordinacion_id");
        b.Property(x => x.PersonaId).HasColumnName("persona_id").IsRequired();
        b.Property(x => x.CarreraId).HasColumnName("carrera_id");
        b.Property(x => x.PeriodoId).HasColumnName("periodo_id").IsRequired();
        b.Property(x => x.Estado).HasColumnName("estado").HasDefaultValue(true).IsRequired();
        b.Property(x => x.Comentarios).HasColumnName("comentarios");

        b.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .HasConstraintName("fk_coordinacion_persona");

        b.HasOne(x => x.Carrera)
            .WithMany()
            .HasForeignKey(x => x.CarreraId)
            .HasConstraintName("fk_coordinacion_carrera");

        b.HasOne(x => x.Periodo)
            .WithMany()
            .HasForeignKey(x => x.PeriodoId)
            .HasConstraintName("fk_coordinacion_periodo");

    }
}
