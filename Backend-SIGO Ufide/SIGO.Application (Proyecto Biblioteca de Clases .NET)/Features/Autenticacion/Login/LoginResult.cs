namespace SIGO.Application.Features.Autenticacion.Login
{
    public enum LoginError
    {
        None = 0,
        UserNotFound = 1,
        WrongPassword = 2,
        LockedOut = 3,
        InactiveUser = 4
    }

    public record LoginResult(
        bool Success,
        SIGO.Application.Features.Usuarios.Dto.UsuarioDto? Usuario,
        LoginError Error,
        string Message
    );
}