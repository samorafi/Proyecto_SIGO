using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;
using SIGO.Application.Features.Usuarios.Commands.Create;

namespace SIGO.Application.Features.Autenticacion.Login;

public class CreateUsuarioCommandHandler : IRequestHandler<CreateUsuarioCommand, int>
{
    private readonly IApplicationDbContext _context;

    // Implementar el servicio de hash
    private readonly IHashService _hashService;

    public CreateUsuarioCommandHandler(IApplicationDbContext context, IHashService hashService)
    {
        _context = context;
        _hashService = hashService;
    }

    public async Task<int> Handle(CreateUsuarioCommand request, CancellationToken cancellationToken)
    {
        // Validamos antes de guardar
        var exists = await _context.Usuarios
            .AnyAsync(u => u.Correo.ToLower() == request.Correo.ToLower(), cancellationToken);

        if (exists)
        {
            // Retornamos un valor especial o lanzamos un mensaje controlado
            return -1; // <-- Indicador de que ya existe
        }


        var usuario = new Usuario
        {
            Nombre = request.Nombre,
            Correo = request.Correo,
            PasswordHash = _hashService.HashPassword(request.Contrasena),
            Activo = true
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync(cancellationToken);

        return usuario.UsuarioId;
    }

}
