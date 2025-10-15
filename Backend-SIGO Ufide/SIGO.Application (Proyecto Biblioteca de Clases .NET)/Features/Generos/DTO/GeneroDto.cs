using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Generos.DTO
{
    public class GeneroDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public static GeneroDto FromEntity(Genero genero)
        {
            return new GeneroDto
            {
                Id = genero.GeneroId,
                Nombre = genero.Nombre
            };
        }
    }
}
