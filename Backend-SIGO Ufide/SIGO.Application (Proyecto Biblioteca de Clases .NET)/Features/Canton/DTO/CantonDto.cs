using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Cantones.DTO
{
    public class CantonDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int ProvinciaId { get; set; }

        public static CantonDto FromEntity(Canton canton)
        {
            return new CantonDto
            {
                Id = canton.CantonId,
                Nombre = canton.Nombre,
                ProvinciaId = canton.ProvinciaId
            };
        }
    }
}