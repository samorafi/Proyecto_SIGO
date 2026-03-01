using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Common.Security;
using SIGO.Application.Abstractions;

namespace SIGO.Infrastructure.Security;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _http;
    private readonly IApplicationDbContext _db;

    public CurrentUserService(IHttpContextAccessor http, IApplicationDbContext db)
    {
        _http = http;
        _db = db;
    }

    public int? PersonaId
    {
        get
        {
            var user = _http.HttpContext?.User;
            if (user == null) return null;

            var raw =
                user.FindFirst("personaId")?.Value ??
                user.FindFirst("PersonaId")?.Value ??
                user.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                user.FindFirst("sub")?.Value;

            return int.TryParse(raw, out var id) ? id : null;
        }
    }

    public async Task<HashSet<string>> GetPermisosAsync(CancellationToken ct)
    {
        var personaId = PersonaId;
        if (!personaId.HasValue) return new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var claves = await _db.UsuarioRoles
            .Where(ur => ur.UsuarioId == personaId.Value)  
            .Join(_db.RolPermisos,
                ur => ur.RolId,
                rp => rp.RolId,
                (ur, rp) => rp.PermisoId)
            .Join(_db.Permisos,
                permisoId => permisoId,
                p => p.PermisoId,
                (permisoId, p) => p.Clave)
            .Distinct()
            .ToListAsync(ct);

        return new HashSet<string>(claves.Where(x => !string.IsNullOrWhiteSpace(x)), StringComparer.OrdinalIgnoreCase);
    }
}
