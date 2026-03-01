using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class AtestadoConfiguration : IEntityTypeConfiguration<Atestado>
{
    public void Configure(EntityTypeBuilder<Atestado> builder)
    {
        builder.ToTable("atestado", "universidad");

        builder.HasKey(a => a.AtestadoId);

        builder.Property(a => a.AtestadoId)
               .HasColumnName("atestado_id");

        builder.Property(a => a.Nombre)
               .HasColumnName("nombre")
               .IsRequired();

        builder.HasIndex(a => a.Nombre)
               .IsUnique();
    }
}
