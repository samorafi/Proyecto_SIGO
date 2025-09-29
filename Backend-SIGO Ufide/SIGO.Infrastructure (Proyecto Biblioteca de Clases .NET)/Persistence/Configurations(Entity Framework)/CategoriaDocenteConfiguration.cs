using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class CategoriaDocenteConfiguration : IEntityTypeConfiguration<CategoriaDocente>
{
    public void Configure(EntityTypeBuilder<CategoriaDocente> builder)
    {
        builder.ToTable("categoria_docente", "universidad");
        builder.HasKey(c => c.CategoriaId);
        builder.Property(c => c.CategoriaId).HasColumnName("categoria_id");
        builder.Property(c => c.Nombre).HasColumnName("nombre").IsRequired();
        builder.HasIndex(c => c.Nombre).IsUnique();
    }
}