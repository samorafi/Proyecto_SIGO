using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class EstadoPersonaConfiguration : IEntityTypeConfiguration<EstadoPersona>
{
    public void Configure(EntityTypeBuilder<EstadoPersona> builder)
    {
        builder.ToTable("estado_persona", "universidad" );
        builder.HasKey(e => e.EstadoPersonaId);
        builder.Property(e => e.EstadoPersonaId).HasColumnName("estado_persona_id");
        builder.Property(e => e.Nombre).HasColumnName("nombre").IsRequired();
        builder.HasIndex(e => e.Nombre).IsUnique();
    }
}

