namespace SIGO.Application.Features.Autenticacion.UnlockUsers.DTO
{
    public class UnlockUserResponse
    {
        public int TotalDesbloqueados { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}