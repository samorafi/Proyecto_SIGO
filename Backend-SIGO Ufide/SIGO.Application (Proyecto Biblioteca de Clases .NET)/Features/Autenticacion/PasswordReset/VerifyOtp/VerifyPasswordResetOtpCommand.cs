using MediatR;
using SIGO.Application.Features.Autenticacion.PasswordReset.Dto;

namespace SIGO.Application.Features.Autenticacion.PasswordReset.VerifyOtp
{
    public class VerifyPasswordResetOtpCommand : IRequest<ResetTokenDto?>
    {
        public string Correo { get; }
        public string Otp { get; }

        public VerifyPasswordResetOtpCommand(string correo, string otp)
        {
            Correo = correo;
            Otp = otp;
        }
    }
}