using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;

namespace SIGO.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<Permiso> Permisos { get; set; }
        public DbSet<UsuarioRol> UsuarioRoles { get; set; }
        public DbSet<RolPermiso> RolPermisos { get; set; }
        public DbSet<Genero> Generos { get; set; }
        public DbSet<Persona> Personas { get; set; }
        public DbSet<Provincia> Provincias { get; set; }
        public DbSet<Canton> Cantones { get; set; }
        public DbSet<CategoriaDocente> CategoriasDocentes { get; set; }
        public DbSet<EstadoPersona> EstadosPersonas { get; set; }
        public DbSet<TipoContrato> TiposContratos { get; set; }
        public DbSet<MotivoDesvinculacion> MotivosDesvinculacion { get; set; }
        public DbSet<Periodo> Periodos { get; set; }
        public DbSet<Oferta> Ofertas => Set<Oferta>();
        public DbSet<Modalidad> Modalidades => Set<Modalidad>();
        public DbSet<Sede> Sedes => Set<Sede>();
        public DbSet<Horario> Horarios => Set<Horario>();
        public DbSet<AccionOferta> AccionesOferta => Set<AccionOferta>();
        public DbSet<Curso> Cursos => Set<Curso>();
        public DbSet<Carrera> Carreras => Set<Carrera>();
        public DbSet<Grado> Grados => Set<Grado>();




        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}
