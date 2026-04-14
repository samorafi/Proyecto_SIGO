using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence.Configurations_Entity_Framework_
{
    public class PasswordResetOtpConfiguration : IEntityTypeConfiguration<PasswordResetOtp>
    {
        public void Configure(EntityTypeBuilder<PasswordResetOtp> builder)
        {
            builder.ToTable("password_reset_otp", schema: "universidad");

            builder.HasKey(x => x.PasswordResetOtpId);

            builder.Property(x => x.PasswordResetOtpId)
                .HasColumnName("password_reset_otp_id");

            builder.Property(x => x.UsuarioId)
                .HasColumnName("usuario_id")
                .IsRequired();

            builder.Property(x => x.OtpHash)
                .HasColumnName("otp_hash")
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            builder.Property(x => x.ExpiresAt)
                .HasColumnName("expires_at")
                .IsRequired();

            builder.Property(x => x.Attempts)
                .HasColumnName("attempts")
                .HasDefaultValue(0);

            builder.Property(x => x.UsedAt)
                .HasColumnName("used_at");

            builder.Property(x => x.LastSentAt)
                .HasColumnName("last_sent_at");

            builder.HasOne(x => x.Usuario)
                .WithMany()
                .HasForeignKey(x => x.UsuarioId);
        }
    }
}