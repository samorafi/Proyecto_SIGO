using MediatR;

namespace SIGO.Application.Features.Autenticacion.PasswordReset.Confirm
{
    public class ConfirmPasswordResetCommand : IRequest<bool>
    {
        public string ResetToken { get; }
        public string NewPassword { get; }

        public ConfirmPasswordResetCommand(string resetToken, string newPassword)
        {
            ResetToken = resetToken;
            NewPassword = newPassword;
        }
    }
}