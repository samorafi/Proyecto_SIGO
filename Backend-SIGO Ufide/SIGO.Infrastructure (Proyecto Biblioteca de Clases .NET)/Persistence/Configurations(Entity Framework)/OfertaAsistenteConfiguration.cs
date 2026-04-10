using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class OfertaAsistenteConfiguration : IEntityTypeConfiguration<OfertaAsistente>
{
    public void Configure(EntityTypeBuilder<OfertaAsistente> builder)
    {
        builder.ToTable("oferta_asistente", "universidad");

        builder.HasKey(x => x.OfertaAsistenteId);
        builder.Property(x => x.OfertaAsistenteId)
               .HasColumnName("oferta_asistente_id");

        builder.Property(x => x.OfertaId)
               .HasColumnName("oferta_id")
               .IsRequired();

        builder.Property(x => x.PersonaId)
               .HasColumnName("persona_id")
               .IsRequired();

        builder.HasIndex(x => new { x.OfertaId, x.PersonaId })
               .IsUnique()
               .HasDatabaseName("ux_oferta_asistente_oferta_persona");

        builder.HasOne(x => x.Oferta)
               .WithMany(x => x.OfertaAsistentes)
               .HasForeignKey(x => x.OfertaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Persona)
               .WithMany()
               .HasForeignKey(x => x.PersonaId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}