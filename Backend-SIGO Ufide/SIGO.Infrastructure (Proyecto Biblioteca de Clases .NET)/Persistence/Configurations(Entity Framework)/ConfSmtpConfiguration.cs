using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations
{
    public class ConfSmtpConfiguration : IEntityTypeConfiguration<ConfSmtp>
    {
        public void Configure(EntityTypeBuilder<ConfSmtp> builder)
        {
            builder.ToTable("conf_smtp", "universidad");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .HasColumnName("id");

            builder.Property(e => e.Host)
                .HasColumnName("host")
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(e => e.Username)
                .HasColumnName("username")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(e => e.Port)
                .HasColumnName("port")
                .IsRequired();

            builder.Property(e => e.EnableSsl)
                .HasColumnName("enable_ssl")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(e => e.SenderName)
                .HasColumnName("sender_name")
                .HasMaxLength(100);

            builder.Property(e => e.SenderEmail)
                .HasColumnName("sender_email")
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(e => e.Password)
                .HasColumnName("password")
                .HasMaxLength(300)
                .IsRequired();

            builder.Property(e => e.UseDefaultCredentials)
                .HasColumnName("use_default_credentials")
                .HasDefaultValue(false);

            builder.Property(e => e.LastUpdated)
                .HasColumnName("last_updated")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
