using SIGO.Domain.Entities;

namespace SIGO.Application.Features.EstadosPersona.DTO
{
    public class EstadoPersonaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public static EstadoPersonaDto FromEntity(EstadoPersona entity)
        {
            return new EstadoPersonaDto
            {
                Id = entity.EstadoPersonaId,
                Nombre = entity.Nombre
            };
        }
    }
}