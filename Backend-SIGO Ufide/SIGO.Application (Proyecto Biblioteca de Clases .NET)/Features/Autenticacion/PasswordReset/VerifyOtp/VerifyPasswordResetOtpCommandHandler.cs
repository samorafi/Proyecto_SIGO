using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Autenticacion.PasswordReset.Dto;
using SIGO.Domain.Entities;
using System.Security.Cryptography;

namespace SIGO.Application.Features.Autenticacion.PasswordReset.VerifyOtp
{
    public class VerifyPasswordResetOtpCommandHandler : IRequestHandler<VerifyPasswordResetOtpCommand, ResetTokenDto?>
    {
        private readonly IApplicationDbContext _db;
        private readonly IHashService _hashService;
        private readonly IHmacService _hmac;

        public VerifyPasswordResetOtpCommandHandler(IApplicationDbContext db, IHashService hashService, IHmacService hmac)
        {
            _db = db;
            _hashService = hashService;
            _hmac = hmac;
        }

        public async Task<ResetTokenDto?> Handle(VerifyPasswordResetOtpCommand request, CancellationToken ct)
        {
            var now = DateTimeOffset.UtcNow;

            var user = await _db.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo, ct);
            if (user == null || !user.Activo) return null;

            var otpRow = await _db.PasswordResetOtps
                .Where(x => x.UsuarioId == user.UsuarioId && x.UsedAt == null)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (otpRow == null) return null;

            // expiración
            if (otpRow.ExpiresAt <= now)
            {
                otpRow.UsedAt = now;
                await _db.SaveChangesAsync(ct);
                return null;
            }

            // intentos
            if (otpRow.Attempts >= 5)
            {
                otpRow.UsedAt = now;
                await _db.SaveChangesAsync(ct);
                return null;
            }

            var ok = _hashService.VerifyPassword(request.Otp, otpRow.OtpHash);
            otpRow.Attempts++;

            if (!ok)
            {
                await _db.SaveChangesAsync(ct);
                return null;
            }

            // OTP correcto: invalidar
            otpRow.UsedAt = now;

            // crear reset token tokenId.secret
            var tokenId = Guid.NewGuid();
            var secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var secretHash = _hmac.HmacSha256(secret);

            _db.PasswordResetTokens.Add(new PasswordResetToken
            {
                TokenId = tokenId,
                UsuarioId = user.UsuarioId,
                SecretHash = secretHash,
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(15),
                UsedAt = null
            });

            await _db.SaveChangesAsync(ct);

            return new ResetTokenDto($"{tokenId}.{secret}");
        }
    }
}