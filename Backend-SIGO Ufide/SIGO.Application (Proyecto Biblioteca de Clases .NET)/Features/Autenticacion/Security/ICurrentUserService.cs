namespace SIGO.Application.Common.Security;

public interface ICurrentUserService
{
    int? PersonaId { get; }
    Task<HashSet<string>> GetPermisosAsync(CancellationToken ct);
}
