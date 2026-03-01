using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class CoordinacionCursoConfiguration : IEntityTypeConfiguration<CoordinacionCurso>
{
    public void Configure(EntityTypeBuilder<CoordinacionCurso> b)
    {
        b.ToTable("coordinacion_curso", "universidad");
        b.HasKey(x => x.CoordinacionCursoId);

        b.Property(x => x.CoordinacionCursoId).HasColumnName("coordinacion_curso_id");
        b.Property(x => x.CoordinacionId).HasColumnName("coordinacion_id").IsRequired();
        b.Property(x => x.CursoId).HasColumnName("curso_id").IsRequired();
        b.Property(x => x.Estado).HasColumnName("estado").HasDefaultValue(true).IsRequired();
        b.Property(x => x.Comentarios).HasColumnName("comentarios");

        b.HasOne(x => x.Coordinacion)
            .WithMany(c => c.Cursos)
            .HasForeignKey(x => x.CoordinacionId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_coordinacioncurso_coordinacion");

        b.HasOne(x => x.Curso)
            .WithMany()
            .HasForeignKey(x => x.CursoId)
            .HasConstraintName("fk_coordinacioncurso_curso");

    }
}
