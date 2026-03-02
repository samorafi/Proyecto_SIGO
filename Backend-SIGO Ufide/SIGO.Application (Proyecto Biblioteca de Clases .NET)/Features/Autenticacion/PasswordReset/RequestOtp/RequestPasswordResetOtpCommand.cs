using MediatR;
using SIGO.Application.Features.Autenticacion.PasswordReset.RequestOtp.Dto;

namespace SIGO.Application.Features.Autenticacion.PasswordReset.RequestOtp
{
    public class RequestPasswordResetOtpCommand : IRequest<RequestOtpResultDto>
    {
        public string Correo { get; }

        public RequestPasswordResetOtpCommand(string correo)
        {
            Correo = correo;
        }
    }
}