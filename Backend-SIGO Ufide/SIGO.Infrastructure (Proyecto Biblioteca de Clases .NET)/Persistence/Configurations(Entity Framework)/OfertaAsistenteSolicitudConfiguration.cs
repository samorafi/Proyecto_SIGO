using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class OfertaAsistenteSolicitudConfiguration : IEntityTypeConfiguration<OfertaAsistenteSolicitud>
{
    public void Configure(EntityTypeBuilder<OfertaAsistenteSolicitud> b)
    {
        b.ToTable("oferta_asistente_solicitud", "universidad");

        b.HasKey(x => x.OfertaAsistenteSolicitudId);

        b.Property(x => x.OfertaAsistenteSolicitudId)
            .HasColumnName("oferta_asistente_solicitud_id");

        b.Property(x => x.OfertaId)
            .HasColumnName("oferta_id")
            .IsRequired();

        b.Property(x => x.PersonaId)
            .HasColumnName("persona_id")
            .IsRequired();

        b.Property(x => x.DestinatarioEmail)
            .HasColumnName("destinatario_email")
            .IsRequired();

        b.Property(x => x.Asunto)
            .HasColumnName("asunto")
            .IsRequired();

        b.Property(x => x.Cuerpo)
            .HasColumnName("cuerpo")
            .IsRequired();

        b.Property(x => x.EstadoSolicitud)
            .HasColumnName("estado_solicitud")
            .IsRequired();

        b.Property(x => x.FechaEnvio)
            .HasColumnName("fecha_envio")
            .IsRequired();

        b.Property(x => x.FechaRespuesta)
            .HasColumnName("fecha_respuesta");

        b.Property(x => x.Token)
            .HasColumnName("token")
            .IsRequired();

        b.Property(x => x.EstadoEnvio)
            .HasColumnName("estado_envio")
            .IsRequired();

        b.Property(x => x.ErrorEnvio)
            .HasColumnName("error_envio");

        b.HasOne(x => x.Oferta)
            .WithMany()
            .HasForeignKey(x => x.OfertaId)
            .HasConstraintName("fk_oas_oferta");

        b.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .HasConstraintName("fk_oas_persona");

        b.HasIndex(x => x.Token)
            .IsUnique()
            .HasDatabaseName("ux_oas_token");

        b.HasIndex(x => new { x.OfertaId, x.PersonaId })
            .HasDatabaseName("ix_oas_oferta_persona");
    }
}