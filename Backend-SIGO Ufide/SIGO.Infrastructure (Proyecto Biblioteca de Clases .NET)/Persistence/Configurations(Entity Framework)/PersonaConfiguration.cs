using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations_Entity_Framework_;

public class PersonaConfiguration : IEntityTypeConfiguration<Persona>
{
    public void Configure(EntityTypeBuilder<Persona> builder)
    {
        builder.ToTable("persona", "universidad");

        // PK
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("persona_id");

        // Columns
        builder.Property(p => p.Nombre).HasColumnName("nombre").IsRequired();
        builder.Property(p => p.PrimerApellido).HasColumnName("primer_apellido");
        builder.Property(p => p.SegundoApellido).HasColumnName("segundo_apellido");
        builder.Property(p => p.Cedula).HasColumnName("cedula").IsRequired();
        builder.Property(p => p.Correo).HasColumnName("correo").IsRequired();
        builder.Property(p => p.Telefono).HasColumnName("telefono");
        builder.Property(p => p.PeriodoIngresoId).HasColumnName("periodo_ingreso_id");

        builder.Property(p => p.Comentarios).HasColumnName("comentarios");

        // FK columns
        builder.Property(p => p.GeneroId).HasColumnName("genero_id");
        builder.Property(p => p.AtestadoId).HasColumnName("atestado_id");
        builder.Property(p => p.ProvinciaId).HasColumnName("provincia_id");
        builder.Property(p => p.CantonId).HasColumnName("canton_id");
        builder.Property(p => p.CategoriaId).HasColumnName("categoria_id");
        builder.Property(p => p.RolDocenteId).HasColumnName("rol_docente_id");
        builder.Property(p => p.EstadoPersonaId).HasColumnName("estado_persona_id");
        builder.Property(p => p.TipoContratoId).HasColumnName("tipo_contrato_id");
        builder.Property(p => p.MotivoDesvinculacionId).HasColumnName("motivo_desvinculacion_id");
        builder.Property(p => p.PeriodoDesvinculacionId).HasColumnName("periodo_desvinculacion_id");
        builder.Property(p => p.EnLinea).HasColumnName("en_linea").HasDefaultValue(false).IsRequired();
        builder.Property(p => p.SedeId).HasColumnName("sede_id");

        builder.HasIndex(p => p.Cedula).IsUnique().HasDatabaseName("ux_persona_cedula");
        builder.HasIndex(p => p.Correo).IsUnique().HasDatabaseName("ux_persona_correo");

        // Navigations
        builder.HasOne(p => p.Genero).WithMany().HasForeignKey(p => p.GeneroId);
        builder.HasOne(p => p.Atestado).WithMany().HasForeignKey(p => p.AtestadoId);
        builder.HasOne(p => p.Provincia).WithMany().HasForeignKey(p => p.ProvinciaId);
        builder.HasOne(p => p.Canton).WithMany().HasForeignKey(p => p.CantonId);
        builder.HasOne(p => p.CategoriaDocente).WithMany().HasForeignKey(p => p.CategoriaId);
        builder.HasOne(p => p.RolDocente).WithMany().HasForeignKey(p => p.RolDocenteId);
        builder.HasOne(p => p.EstadoPersona).WithMany().HasForeignKey(p => p.EstadoPersonaId);
        builder.HasOne(p => p.TipoContrato).WithMany().HasForeignKey(p => p.TipoContratoId);
        builder.HasOne(p => p.MotivoDesvinculacion).WithMany().HasForeignKey(p => p.MotivoDesvinculacionId);
        builder.HasOne(p => p.PeriodoDesvinculacion).WithMany().HasForeignKey(p => p.PeriodoDesvinculacionId);
        builder.HasOne(p => p.PeriodoIngreso).WithMany().HasForeignKey(p => p.PeriodoIngresoId).OnDelete(DeleteBehavior.Restrict).HasConstraintName("fk_persona_periodo_ingreso");
        builder.HasOne(p => p.Sede).WithMany().HasForeignKey(p => p.SedeId);
    }
}
