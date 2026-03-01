using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class RolDocenteConfiguration : IEntityTypeConfiguration<RolDocente>
{
    public void Configure(EntityTypeBuilder<RolDocente> b)
    {
        b.ToTable("rol_docente", "universidad");

        b.HasKey(x => x.RolId);
        b.Property(x => x.RolId).HasColumnName("rol_id");

        b.Property(x => x.Nombre)
         .HasColumnName("nombre")
         .IsRequired();

    }
}
