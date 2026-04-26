using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Autenticacion.UnlockUsers.DTO;

namespace SIGO.Application.Features.Autenticacion.UnlockUsers.Commands
{
    public class UnlockUserCommandHandler
        : IRequestHandler<UnlockUserCommand, UnlockUserResponse>
    {
        private readonly IApplicationDbContext _context;

        public UnlockUserCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UnlockUserResponse> Handle(
            UnlockUserCommand request,
            CancellationToken cancellationToken)
        {
            if (request.UsuarioIds == null || !request.UsuarioIds.Any())
            {
                return new UnlockUserResponse
                {
                    TotalDesbloqueados = 0,
                    Mensaje = "No se enviaron usuarios."
                };
            }

            var usuariosSql = "{" + string.Join(",", request.UsuarioIds) + "}";

            var result = await _context.SqlQueryAsync<UnlockUserResponse>(
                $"""
                SELECT 
                    total_desbloqueados AS "TotalDesbloqueados",
                    mensaje AS "Mensaje"
                FROM universidad.desbloquear_usuarios({usuariosSql}::int[]);
                """,
                cancellationToken
            );

            return result.SingleOrDefault() ?? new UnlockUserResponse
            {
                TotalDesbloqueados = 0,
                Mensaje = "No se realizaron cambios."
            };
        }
    }
}