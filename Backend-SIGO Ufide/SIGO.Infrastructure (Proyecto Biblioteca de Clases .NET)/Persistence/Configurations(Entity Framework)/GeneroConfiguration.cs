using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

// Archivo: GeneroConfiguration.cs
public class GeneroConfiguration : IEntityTypeConfiguration<Genero>
{
    public void Configure(EntityTypeBuilder<Genero> builder)
    {
        builder.ToTable("genero", "universidad");
        builder.HasKey(g => g.GeneroId);
        builder.Property(g => g.GeneroId).HasColumnName("genero_id");
        builder.Property(g => g.Nombre).HasColumnName("nombre").IsRequired();
        builder.HasIndex(g => g.Nombre).IsUnique();
    }
}
