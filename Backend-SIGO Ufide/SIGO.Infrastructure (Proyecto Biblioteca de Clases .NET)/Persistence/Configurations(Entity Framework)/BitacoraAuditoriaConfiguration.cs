using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations
{
    public class BitacoraAuditoriaConfiguration : IEntityTypeConfiguration<BitacoraAuditoria>
    {
        public void Configure(EntityTypeBuilder<BitacoraAuditoria> builder)
        {
            builder.ToTable("bitacora_auditoria", "universidad");

            builder.HasKey(b => b.Id);

            builder.Property(b => b.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(b => b.Usuario)
                   .HasColumnName("usuario")
                   .HasMaxLength(150);

            builder.Property(b => b.TablaAfectada)
                   .HasColumnName("tabla_afectada")
                   .HasMaxLength(100);

            builder.Property(b => b.Accion)
                   .HasColumnName("accion")
                   .HasMaxLength(20);

            builder.Property(b => b.RegistroId)
                   .HasColumnName("registro_id");

            builder.Property(b => b.ValoresAnteriores)
                   .HasColumnName("valores_anteriores")
                   .HasColumnType("jsonb");

            builder.Property(b => b.ValoresNuevos)
                   .HasColumnName("valores_nuevos")
                   .HasColumnType("jsonb");

            builder.Property(b => b.Fecha)
                   .HasColumnName("fecha")
                   .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(b => b.IpOrigen)
                   .HasColumnName("ip_origen")
                   .HasMaxLength(50);

            builder.Property(b => b.Descripcion)
                   .HasColumnName("descripcion");

            builder.HasIndex(b => b.Fecha);
            builder.HasIndex(b => b.TablaAfectada);

        }
    }
}
