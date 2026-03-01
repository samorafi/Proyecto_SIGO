using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities; 

public class CantonConfiguration : IEntityTypeConfiguration<Canton>
{
    public void Configure(EntityTypeBuilder<Canton> builder)
    {
        builder.ToTable("canton", "universidad");
        builder.HasKey(c => c.CantonId);
        builder.Property(c => c.CantonId).HasColumnName("canton_id");
        builder.Property(c => c.Nombre).HasColumnName("nombre").IsRequired();
        builder.Property(c => c.ProvinciaId).HasColumnName("provincia_id");

        // Índice único compuesto
        builder.HasIndex(c => new { c.ProvinciaId, c.Nombre }).IsUnique();
    }
}
