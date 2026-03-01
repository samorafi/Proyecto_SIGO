using SIGO.Domain.Entities;

namespace SIGO.Application.Features.CategoriaDocentes.DTO
{
    public class CategoriaDocenteDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public static CategoriaDocenteDto FromEntity(CategoriaDocente entity)
        {
            return new CategoriaDocenteDto
            {
                Id = entity.CategoriaId,
                Nombre = entity.Nombre
            };
        }
    }
}