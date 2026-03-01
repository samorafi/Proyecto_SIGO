using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations_Entity_Framework_;

public class TipoContratoConfiguration : IEntityTypeConfiguration<TipoContrato>
{
    public void Configure(EntityTypeBuilder<TipoContrato> builder)
    {
        builder.ToTable("tipo_contrato", "universidad");
        builder.HasKey(t => t.TipoContratoId);
        builder.Property(t => t.TipoContratoId).HasColumnName("tipo_contrato_id");
        builder.Property(t => t.Nombre).HasColumnName("nombre");
    }
}