namespace SIGO.Application.Features.Usuarios.Dto
{
    public record LoginRequest(string Correo, string Contrasena);
    public record UsuarioDto(int UsuarioId, string Nombre, string Correo, bool Activo);
}
