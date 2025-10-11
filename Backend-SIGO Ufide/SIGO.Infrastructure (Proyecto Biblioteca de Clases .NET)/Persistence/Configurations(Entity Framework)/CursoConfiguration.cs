using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class CursoConfiguration : IEntityTypeConfiguration<Curso>
{
    public void Configure(EntityTypeBuilder<Curso> b)
    {
        b.ToTable("curso", "universidad");
        b.HasKey(x => x.CursoId);

        b.Property(x => x.CursoId).HasColumnName("curso_id");
        b.Property(x => x.Codigo).HasColumnName("codigo").IsRequired();
        b.Property(x => x.Nombre).HasColumnName("nombre").IsRequired();
        b.Property(x => x.EsNetcad).HasColumnName("es_netcad").HasDefaultValue(false).IsRequired();
        b.Property(x => x.Estado).HasColumnName("estado").HasDefaultValue(true).IsRequired();

        b.Property(x => x.CarreraId).HasColumnName("carrera_id");
        b.Property(x => x.GradoId).HasColumnName("grado_id");

        b.HasIndex(x => x.Codigo).IsUnique().HasDatabaseName("ux_curso_codigo");

        b.HasOne(x => x.Carrera)
            .WithMany()                   // o .WithMany(c => c.Cursos) si la colección existe
            .HasForeignKey(x => x.CarreraId)
            .HasConstraintName("fk_curso_carrera");

        b.HasOne(x => x.Grado)
            .WithMany()                   // o .WithMany(g => g.Cursos)
            .HasForeignKey(x => x.GradoId)
            .HasConstraintName("fk_curso_grado");
    }
}
