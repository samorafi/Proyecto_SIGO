using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations_Entity_Framework_;

public class PersonaConfiguration : IEntityTypeConfiguration<Persona>
{
    public void Configure(EntityTypeBuilder<Persona> builder)
    {
        builder.ToTable("persona", "universidad");// Mapeo a la tabla 'persona'

        // Clave Primaria
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("persona_id");

        // Mapeo de Columnas
        builder.Property(p => p.Nombre).HasColumnName("nombre").IsRequired();
        builder.Property(p => p.Cedula).HasColumnName("cedula").IsRequired();
        builder.Property(p => p.Correo).HasColumnName("correo").IsRequired();
        builder.Property(p => p.Telefono).HasColumnName("telefono");
        builder.Property(p => p.FechaIngreso).HasColumnName("fecha_ingreso");
        builder.Property(p => p.Comentarios).HasColumnName("comentarios");

        // Mapeo de Claves Foráneas
        builder.Property(p => p.GeneroId).HasColumnName("genero_id");
        builder.Property(p => p.ProvinciaId).HasColumnName("provincia_id");
        builder.Property(p => p.CantonId).HasColumnName("canton_id");
        builder.Property(p => p.CategoriaId).HasColumnName("categoria_id");
        builder.Property(p => p.EstadoPersonaId).HasColumnName("estado_persona_id");
        builder.Property(p => p.TipoContratoId).HasColumnName("tipo_contrato_id");
        builder.Property(p => p.MotivoDesvinculacionId).HasColumnName("motivo_desvinculacion_id");
        builder.Property(p => p.PeriodoDesvinculacionId).HasColumnName("periodo_desvinculacion_id");

        // Definición de Relaciones (Navigation Properties)
        builder.HasOne(p => p.Genero).WithMany().HasForeignKey(p => p.GeneroId);
        builder.HasOne(p => p.Provincia).WithMany().HasForeignKey(p => p.ProvinciaId);
        builder.HasOne(p => p.Canton).WithMany().HasForeignKey(p => p.CantonId);
        builder.HasOne(p => p.CategoriaDocente).WithMany().HasForeignKey(p => p.CategoriaId);
        builder.HasOne(p => p.EstadoPersona).WithMany().HasForeignKey(p => p.EstadoPersonaId);
        builder.HasOne(p => p.TipoContrato).WithMany().HasForeignKey(p => p.TipoContratoId);
        builder.HasOne(p => p.MotivoDesvinculacion).WithMany().HasForeignKey(p => p.MotivoDesvinculacionId);
        builder.HasOne(p => p.PeriodoDesvinculacion).WithMany().HasForeignKey(p => p.PeriodoDesvinculacionId);
    }
}

