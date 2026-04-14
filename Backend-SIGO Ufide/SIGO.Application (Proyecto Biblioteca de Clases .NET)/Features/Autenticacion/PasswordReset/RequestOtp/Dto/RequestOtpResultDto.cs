namespace SIGO.Application.Features.Autenticacion.PasswordReset.RequestOtp.Dto
{
    public class RequestOtpResultDto
    {
        public bool Sent { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? CooldownSeconds { get; set; }
    }
}