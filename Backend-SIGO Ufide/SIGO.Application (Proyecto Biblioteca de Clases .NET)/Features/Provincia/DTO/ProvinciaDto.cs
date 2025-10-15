using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Provincias.DTO
{
    public class ProvinciaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public static ProvinciaDto FromEntity(Provincia provincia)
        {
            return new ProvinciaDto
            {
                Id = provincia.ProvinciaId,
                Nombre = provincia.Nombre
            };
        }
    }
}