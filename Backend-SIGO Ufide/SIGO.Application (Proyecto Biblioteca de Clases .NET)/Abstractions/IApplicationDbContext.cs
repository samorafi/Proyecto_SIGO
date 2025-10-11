using Microsoft.EntityFrameworkCore;
using SIGO.Domain.Entities;
using System.Collections.Generic;

namespace SIGO.Application.Abstractions
{
    public interface IApplicationDbContext
    {
        DbSet<Usuario> Usuarios { get; }
        DbSet<Rol> Roles { get; }
        DbSet<Permiso> Permisos { get; }
        DbSet<UsuarioRol> UsuarioRoles { get; }
        DbSet<RolPermiso> RolPermisos { get; }
        DbSet<Persona> Personas { get; set; }
        DbSet<Provincia> Provincias { get; set; }
        DbSet<Canton> Cantones { get; set; }
        DbSet<Genero> Generos { get;}
        DbSet<CategoriaDocente> CategoriasDocentes { get; set; }
        DbSet<EstadoPersona> EstadosPersonas { get; set; }
        DbSet<TipoContrato> TiposContratos { get; set; }
        DbSet<MotivoDesvinculacion> MotivosDesvinculacion { get; set; }
        DbSet<Periodo> Periodos { get; set; }
        DbSet<Oferta> Ofertas { get; }
        DbSet<Curso> Cursos { get; }
        DbSet<Sede> Sedes { get; }
        DbSet<Modalidad> Modalidades { get; }
        DbSet<Horario> Horarios { get; }
        DbSet<AccionOferta> AccionesOferta { get; }
        DbSet<Grado> Grados { get; }
        DbSet<Carrera> Carreras { get; }


        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
