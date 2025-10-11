using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class OfertaConfiguration : IEntityTypeConfiguration<Oferta>
{
    public void Configure(EntityTypeBuilder<Oferta> b)
    {
        b.ToTable("oferta", "universidad");
        b.HasKey(x => x.OfertaId);

        b.Property(x => x.OfertaId).HasColumnName("oferta_id");
        b.Property(x => x.CursoId).HasColumnName("curso_id").IsRequired();
        b.Property(x => x.SedeId).HasColumnName("sede_id").IsRequired();
        b.Property(x => x.ModalidadId).HasColumnName("modalidad_id").IsRequired();
        b.Property(x => x.HorarioId).HasColumnName("horario_id").IsRequired();
        b.Property(x => x.PeriodoId).HasColumnName("periodo_id").IsRequired();
        b.Property(x => x.AccionId).HasColumnName("accion_id");
        b.Property(x => x.CoordinadorId).HasColumnName("coordinador_id");
        b.Property(x => x.Comentarios).HasColumnName("comentarios");

        b.HasOne(o => o.Curso).WithMany().HasForeignKey(o => o.CursoId);
        b.HasOne(o => o.Sede).WithMany().HasForeignKey(o => o.SedeId);
        b.HasOne(o => o.Modalidad).WithMany().HasForeignKey(o => o.ModalidadId);
        b.HasOne(o => o.Horario).WithMany().HasForeignKey(o => o.HorarioId);
        b.HasOne(o => o.Periodo).WithMany().HasForeignKey(o => o.PeriodoId);

        b.HasOne(o => o.Accion).WithMany().HasForeignKey(o => o.AccionId).HasConstraintName("fk_oferta_accion");
        b.HasOne(o => o.Coordinador).WithMany().HasForeignKey(o => o.CoordinadorId).HasConstraintName("fk_oferta_coordinador");
    }
}
