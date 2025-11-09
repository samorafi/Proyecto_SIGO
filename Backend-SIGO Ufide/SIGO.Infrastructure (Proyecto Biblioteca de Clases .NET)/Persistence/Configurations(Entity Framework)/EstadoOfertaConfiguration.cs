using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

public class EstadoOfertaConfiguration : IEntityTypeConfiguration<EstadoOferta>
{
    public void Configure(EntityTypeBuilder<EstadoOferta> b)
    {
        b.ToTable("estado_ofertas", "universidad");
        b.HasKey(x => x.EstadoOfertaId).HasName("pk_estado_ofertas");
        b.Property(x => x.EstadoOfertaId).HasColumnName("estado_oferta_id");
        b.Property(x => x.Nombre).HasColumnName("nombre").IsRequired();
        b.HasIndex(x => x.Nombre).IsUnique();
    }
}
