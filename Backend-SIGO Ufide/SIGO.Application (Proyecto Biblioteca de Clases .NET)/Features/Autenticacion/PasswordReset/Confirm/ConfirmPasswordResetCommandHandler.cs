using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;

namespace SIGO.Application.Features.Autenticacion.PasswordReset.Confirm
{
    public class ConfirmPasswordResetCommandHandler : IRequestHandler<ConfirmPasswordResetCommand, bool>
    {
        private readonly IApplicationDbContext _db;
        private readonly IHashService _hashService;
        private readonly IHmacService _hmac;

        public ConfirmPasswordResetCommandHandler(IApplicationDbContext db, IHashService hashService, IHmacService hmac)
        {
            _db = db;
            _hashService = hashService;
            _hmac = hmac;
        }

        public async Task<bool> Handle(ConfirmPasswordResetCommand request, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
                return false;

            var parts = request.ResetToken.Split('.', 2);
            if (parts.Length != 2) return false;

            if (!Guid.TryParse(parts[0], out var tokenId)) return false;
            var secret = parts[1];

            var now = DateTimeOffset.UtcNow;

            var tokenRow = await _db.PasswordResetTokens.FirstOrDefaultAsync(t => t.TokenId == tokenId, ct);
            if (tokenRow == null) return false;
            if (tokenRow.UsedAt != null) return false;
            if (tokenRow.ExpiresAt <= now) return false;

            var secretHash = _hmac.HmacSha256(secret);
            if (secretHash != tokenRow.SecretHash) return false;

            var user = await _db.Usuarios.FirstOrDefaultAsync(u => u.UsuarioId == tokenRow.UsuarioId, ct);
            if (user == null || !user.Activo) return false;

            user.PasswordHash = _hashService.HashPassword(request.NewPassword);

            // reset lockout
            user.AccessFailedCount = 0;
            user.LockoutEnd = null;

            tokenRow.UsedAt = now;

            await _db.SaveChangesAsync(ct);
            return true;
        }
    }
}