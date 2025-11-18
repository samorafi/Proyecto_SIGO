using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class SolicitudOfertaConfiguration : IEntityTypeConfiguration<SolicitudOferta>
{
    public void Configure(EntityTypeBuilder<SolicitudOferta> b)
    {
        b.ToTable("solicitud_oferta", "universidad");
        b.HasKey(x => x.SolicitudOfertaId);
        b.Property(x => x.SolicitudOfertaId).HasColumnName("solicitud_oferta_id");
        b.Property(x => x.OfertaId).HasColumnName("oferta_id").IsRequired();
        b.Property(x => x.PersonaId).HasColumnName("persona_id").IsRequired();
        b.Property(x => x.DestinatarioEmail).HasColumnName("destinatario_email").IsRequired();
        b.Property(x => x.Asunto).HasColumnName("asunto").IsRequired();
        b.Property(x => x.Cuerpo).HasColumnName("cuerpo").IsRequired();
        b.Property(x => x.EstadoSolicitud).HasColumnName("estado_solicitud").IsRequired();
        b.Property(x => x.FechaEnvio).HasColumnName("fecha_envio").IsRequired();
        b.Property(x => x.FechaRespuesta).HasColumnName("fecha_respuesta");
        b.Property(x => x.Token).HasColumnName("token").IsRequired();
        b.Property(x => x.EstadoEnvio).HasColumnName("estado_envio").IsRequired();
        b.Property(x => x.ErrorEnvio).HasColumnName("error_envio");
        // Relaciones

        b.HasOne(s => s.Oferta).WithMany().HasForeignKey(s => s.OfertaId).HasConstraintName("fk_solicitud_oferta_oferta");
        b.HasOne(s => s.Persona).WithMany().HasForeignKey(s => s.PersonaId).HasConstraintName("fk_solicitud_oferta_persona");

        // Índices
        b.HasIndex(x => x.Token).IsUnique().HasDatabaseName("ux_solicitud_oferta_token");
        b.HasIndex(x => new { x.OfertaId, x.PersonaId }).HasDatabaseName("ix_solicitud_oferta_oferta_persona");

    }
}
