using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations;

public class NotificacionConfiguration : IEntityTypeConfiguration<Notificacion>
{
    public void Configure(EntityTypeBuilder<Notificacion> b)
    {
        b.ToTable("notificaciones", "universidad");

        b.HasKey(x => x.NotificacionId);

        b.Property(x => x.NotificacionId).HasColumnName("notificacion_id");
        b.Property(x => x.PersonaId).HasColumnName("persona_id").IsRequired();
        b.Property(x => x.OfertaId).HasColumnName("oferta_id").IsRequired();
        b.Property(x => x.SolicitudOfertaId).HasColumnName("solicitud_oferta_id").IsRequired();

        b.Property(x => x.Leido).HasColumnName("leido").HasDefaultValue(false);
        b.Property(x => x.Mensaje).HasColumnName("mensaje").IsRequired();

        b.Property(x => x.FechaCreacion)
            .HasColumnName("fecha_creacion")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("NOW()")
            .IsRequired();

        b.Property(x => x.FechaEvento)
          .HasColumnName("fecha_evento")
          .HasColumnType("timestamp with time zone");


        b.HasOne(x => x.Persona)
            .WithMany()
            .HasForeignKey(x => x.PersonaId)
            .HasConstraintName("fk_notificaciones_persona");

        b.HasOne(x => x.Oferta)
            .WithMany()
            .HasForeignKey(x => x.OfertaId)
            .HasConstraintName("fk_notificaciones_oferta");

        b.HasOne(x => x.SolicitudOferta)
            .WithMany()
            .HasForeignKey(x => x.SolicitudOfertaId)
            .HasConstraintName("fk_notificaciones_solicitud_oferta");

        b.HasIndex(x => new { x.PersonaId, x.Leido, x.FechaCreacion })
            .HasDatabaseName("ix_notificaciones_persona_leido_fecha");

        b.HasIndex(x => x.SolicitudOfertaId)
            .HasDatabaseName("ix_notificaciones_solicitud");
    }
}
